
package com.makemytrip.makemytrip.services;

import com.makemytrip.makemytrip.models.Flight;
import com.makemytrip.makemytrip.models.Hotel;
import com.makemytrip.makemytrip.models.Recommendation;
import com.makemytrip.makemytrip.models.Users;
import com.makemytrip.makemytrip.repositories.FlightRepository;
import com.makemytrip.makemytrip.repositories.HotelRepository;
import com.makemytrip.makemytrip.repositories.RecommendationRepository;
import com.makemytrip.makemytrip.repositories.UserRepository;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.Set;

@Service
public class RecommendationService {

    private static final double DEFAULT_SCORE = 25.0;
    private static final double LOCATION_MATCH_BONUS = 30.0;
    private static final double ROOM_TYPE_MATCH_BONUS = 10.0;
    private static final double DESTINATION_MATCH_BONUS = 30.0;
    private static final double COLLABORATIVE_BONUS = 20.0;
    private static final double HELPFUL_BONUS = 15.0;
    private static final double IRRELEVANT_PENALTY = 25.0;

    private final RecommendationRepository recommendationRepository;
    private final UserRepository userRepository;
    private final FlightRepository flightRepository;
    private final HotelRepository hotelRepository;

    public RecommendationService(
            RecommendationRepository recommendationRepository,
            UserRepository userRepository,
            FlightRepository flightRepository,
            HotelRepository hotelRepository) {

        this.recommendationRepository = recommendationRepository;
        this.userRepository = userRepository;
        this.flightRepository = flightRepository;
        this.hotelRepository = hotelRepository;
    }

    // =====================================================
    // GET PERSONALIZED RECOMMENDATIONS
    // =====================================================

    public List<Recommendation> getRecommendations(String userId) {

        Users currentUser = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found: " + userId));

        Set<String> currentBookings = getActiveBookingKeys(currentUser);

        Set<String> preferredLocations = new HashSet<>();
        Set<String> preferredDestinations = new HashSet<>();
        Set<String> preferredRoomTypes = new HashSet<>();

        // Build preferences from active booking history.
        for (Users.Booking booking : safeBookings(currentUser)) {

            if (!isActiveBooking(booking)) {
                continue;
            }

            String type = normalizeType(booking.getType());

            if ("HOTEL".equals(type)) {

                hotelRepository.findById(booking.getBookingId())
                        .ifPresent(hotel -> {

                            if (hotel.getLocation() != null) {
                                preferredLocations.add(
                                        hotel.getLocation().trim()
                                                .toLowerCase(Locale.ROOT));
                            }

                            if (booking.getSelectedRoomType() != null) {
                                preferredRoomTypes.add(
                                        booking.getSelectedRoomType().trim()
                                                .toLowerCase(Locale.ROOT));
                            }
                        });

            } else if ("FLIGHT".equals(type)) {

                flightRepository.findById(booking.getBookingId())
                        .ifPresent(flight -> {

                            if (flight.getTo() != null) {
                                preferredDestinations.add(
                                        flight.getTo().trim()
                                                .toLowerCase(Locale.ROOT));
                            }
                        });
            }
        }

        List<Recommendation> results = new ArrayList<>();

        // =================================================
        // HOTEL RECOMMENDATIONS
        // =================================================

        for (Hotel hotel : hotelRepository.findAll()) {

            if (hotel.getId() == null) {
                continue;
            }

            String itemKey = makeKey("HOTEL", hotel.getId());

            // Do not recommend an already-booked active item.
            if (currentBookings.contains(itemKey)) {
                continue;
            }

            double baseScore = DEFAULT_SCORE;
            List<String> reasons = new ArrayList<>();

            reasons.add("Recommended from your travel preferences");

            if (hotel.getLocation() != null
                    && preferredLocations.contains(
                    hotel.getLocation().trim().toLowerCase(Locale.ROOT))) {

                baseScore += LOCATION_MATCH_BONUS;
                reasons.add(
                        "Matches a location from your booking history");
            }

            if (hotel.getRoomTypes() != null
                    && hotel.getRoomTypes().stream()
                    .filter(room -> room != null)
                    .map(room -> room.trim().toLowerCase(Locale.ROOT))
                    .anyMatch(preferredRoomTypes::contains)) {

                baseScore += ROOM_TYPE_MATCH_BONUS;
                reasons.add("Offers a room type you selected before");
            }

            Recommendation recommendation = upsert(
                    userId,
                    "HOTEL",
                    hotel.getId(),
                    hotel.getHotelName(),
                    "Hotel in " + hotel.getLocation(),
                    String.join(". ", reasons),
                    baseScore
            );

            results.add(recommendation);
        }

        // =================================================
        // FLIGHT RECOMMENDATIONS
        // =================================================

        for (Flight flight : flightRepository.findAll()) {

            if (flight.getId() == null) {
                continue;
            }

            String itemKey = makeKey("FLIGHT", flight.getId());

            if (currentBookings.contains(itemKey)) {
                continue;
            }

            double baseScore = DEFAULT_SCORE;
            List<String> reasons = new ArrayList<>();

            reasons.add("Recommended from your travel preferences");

            if (flight.getTo() != null
                    && preferredDestinations.contains(
                    flight.getTo().trim().toLowerCase(Locale.ROOT))) {

                baseScore += DESTINATION_MATCH_BONUS;
                reasons.add(
                        "Matches a destination from your booking history");
            }

            Recommendation recommendation = upsert(
                    userId,
                    "FLIGHT",
                    flight.getId(),
                    flight.getFlightName(),
                    "Flight from " + flight.getFrom()
                            + " to " + flight.getTo(),
                    String.join(". ", reasons),
                    baseScore
            );

            results.add(recommendation);
        }

        // Apply collaborative filtering and calculate final scores.
        applyCollaborativeFiltering(userId, currentBookings, results);

        // Scores already include algorithm and feedback adjustments.
        results.sort(
                Comparator.comparingDouble(Recommendation::getScore)
                        .reversed()
        );

        return results;
    }

    // =====================================================
    // COLLABORATIVE FILTERING
    // =====================================================

    private void applyCollaborativeFiltering(
            String currentUserId,
            Set<String> currentBookings,
            List<Recommendation> recommendations) {

        Set<String> collaborativeItems = new HashSet<>();

        if (currentBookings.isEmpty()) {
            resetToContentBased(recommendations);
            return;
        }

        for (Users otherUser : userRepository.findAll()) {

            if (otherUser.getId() == null
                    || otherUser.getId().equals(currentUserId)) {
                continue;
            }

            Set<String> otherBookings = getActiveBookingKeys(otherUser);

            Set<String> commonBookings = new HashSet<>(currentBookings);
            commonBookings.retainAll(otherBookings);

            if (commonBookings.isEmpty()) {
                continue;
            }

            // Recommend candidate items booked by similar users.
            for (String otherItem : otherBookings) {

                if (currentBookings.contains(otherItem)) {
                    continue;
                }

                boolean isCandidate = recommendations.stream()
                        .anyMatch(recommendation ->
                                makeKey(
                                        recommendation.getItemType(),
                                        recommendation.getItemId()
                                ).equals(otherItem)
                        );

                if (isCandidate) {
                    collaborativeItems.add(otherItem);
                }
            }
        }

        for (Recommendation recommendation : recommendations) {

            String itemKey = makeKey(
                    recommendation.getItemType(),
                    recommendation.getItemId()
            );

            if (collaborativeItems.contains(itemKey)) {

                recommendation.setAlgorithm("HYBRID");

                String explanation =
                        "Users with booking history similar to yours "
                                + "also booked this item.";

                String existingReason = recommendation.getReason();

                if (existingReason == null
                        || !existingReason.contains(explanation)) {

                    recommendation.setReason(
                            (existingReason == null
                                    || existingReason.isBlank())
                                    ? explanation
                                    : existingReason + ". " + explanation
                    );
                }

            } else {
                recommendation.setAlgorithm("CONTENT_BASED");
            }

            // Recalculate once using the current algorithm and feedback.
            recalculateScore(recommendation);

            recommendation.setUpdatedAt(LocalDateTime.now().toString());
            recommendationRepository.save(recommendation);
        }
    }

    private void resetToContentBased(
            List<Recommendation> recommendations) {

        for (Recommendation recommendation : recommendations) {

            recommendation.setAlgorithm("CONTENT_BASED");

            recalculateScore(recommendation);

            recommendation.setUpdatedAt(LocalDateTime.now().toString());
            recommendationRepository.save(recommendation);
        }
    }

    // =====================================================
    // SCORE CALCULATION
    // =====================================================

    /**
     * baseScore contains only the content-based score.
     *
     * Final score =
     * baseScore
     * + collaborative bonus when HYBRID
     * + feedback adjustment
     *
     * Recalculation is deterministic, so repeated API requests
     * will not repeatedly add or subtract bonuses.
     */
    private void recalculateScore(Recommendation recommendation) {

        double score = recommendation.getBaseScore();

        String algorithm = recommendation.getAlgorithm();

        if ("HYBRID".equalsIgnoreCase(algorithm)) {
            score += COLLABORATIVE_BONUS;
        }

        String feedback = recommendation.getFeedback();

        if ("HELPFUL".equalsIgnoreCase(feedback)) {
            score += HELPFUL_BONUS;
        } else if ("IRRELEVANT".equalsIgnoreCase(feedback)) {
            score -= IRRELEVANT_PENALTY;
        }

        recommendation.setScore(score);
    }

    // =====================================================
    // BOOKING HELPERS
    // =====================================================

    private Set<String> getActiveBookingKeys(Users user) {

        Set<String> keys = new HashSet<>();

        for (Users.Booking booking : safeBookings(user)) {

            if (!isActiveBooking(booking)) {
                continue;
            }

            String type = normalizeType(booking.getType());
            String bookingId = booking.getBookingId();

            if (bookingId != null && !type.isBlank()) {
                keys.add(makeKey(type, bookingId));
            }
        }

        return keys;
    }

    private List<Users.Booking> safeBookings(Users user) {

        return user.getBookings() == null
                ? new ArrayList<>()
                : user.getBookings();
    }

    private boolean isActiveBooking(Users.Booking booking) {

        if (booking == null) {
            return false;
        }

        String status = booking.getBookingStatus();

        return status == null
                || status.isBlank()
                || (!status.equalsIgnoreCase("CANCELLED")
                && !status.equalsIgnoreCase("CANCELED"));
    }

    private String normalizeType(String type) {

        if (type == null) {
            return "";
        }

        String normalized = type.trim().toUpperCase(Locale.ROOT);

        if (normalized.equals("HOTEL")) {
            return "HOTEL";
        }

        if (normalized.equals("FLIGHT")) {
            return "FLIGHT";
        }

        return normalized;
    }

    private String makeKey(String type, String itemId) {
        return normalizeType(type) + ":" + itemId;
    }

    // =====================================================
    // UPSERT RECOMMENDATION
    // =====================================================

    private Recommendation upsert(
            String userId,
            String itemType,
            String itemId,
            String title,
            String description,
            String reason,
            double baseScore) {

        Optional<Recommendation> existing =
                recommendationRepository
                        .findByUserIdAndItemTypeAndItemId(
                                userId, itemType, itemId);

        Recommendation recommendation;

        if (existing.isPresent()) {

            recommendation = existing.get();

            // Do not reset existing feedback to NONE.
            // Preserve HELPFUL or IRRELEVANT across requests.

        } else {

            recommendation = new Recommendation();
            recommendation.setUserId(userId);
            recommendation.setItemType(itemType);
            recommendation.setItemId(itemId);
            recommendation.setCreatedAt(LocalDateTime.now().toString());
            recommendation.setFeedback("NONE");
        }

        recommendation.setTitle(title);
        recommendation.setDescription(description);
        recommendation.setReason(reason);
        recommendation.setBaseScore(baseScore);

        // Algorithm is determined by collaborative filtering later.
        // Calculate a valid temporary content-based score here.
        recommendation.setAlgorithm("CONTENT_BASED");
        recalculateScore(recommendation);

        recommendation.setUpdatedAt(LocalDateTime.now().toString());

        return recommendationRepository.save(recommendation);
    }

    // =====================================================
    // SUBMIT FEEDBACK
    // =====================================================

    public Recommendation submitFeedback(
            String userId,
            String recommendationId,
            String feedback) {

        if (feedback == null
                || (!feedback.equalsIgnoreCase("HELPFUL")
                && !feedback.equalsIgnoreCase("IRRELEVANT"))) {

            throw new IllegalArgumentException(
                    "Feedback must be HELPFUL or IRRELEVANT");
        }

        Recommendation recommendation =
                recommendationRepository
                        .findByIdAndUserId(recommendationId, userId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Recommendation not found"));

        String normalizedFeedback =
                feedback.trim().toUpperCase(Locale.ROOT);

        recommendation.setFeedback(normalizedFeedback);

        // Keep the existing algorithm. Recalculate the final score
        // from baseScore so adjustments are never duplicated.
        recalculateScore(recommendation);

        recommendation.setUpdatedAt(LocalDateTime.now().toString());

        return recommendationRepository.save(recommendation);
    }
}
