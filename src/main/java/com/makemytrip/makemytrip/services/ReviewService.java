package com.makemytrip.makemytrip.services;

import com.makemytrip.makemytrip.models.Review;
import com.makemytrip.makemytrip.models.Users;
import com.makemytrip.makemytrip.repositories.ReviewRepository;
import com.makemytrip.makemytrip.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private UserRepository userRepository;


    // ==========================================
    // CREATE REVIEW
    // ==========================================

    public Review createReview(
            String userId,
            String targetType,
            String targetId,
            String targetName,
            int rating,
            String comment,
            List<String> photos) {

        // Validate user
        Users user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        // Validate target type
        if (targetType == null ||
                (!targetType.equalsIgnoreCase("HOTEL")
                        && !targetType.equalsIgnoreCase("FLIGHT"))) {

            throw new RuntimeException(
                    "Target type must be HOTEL or FLIGHT"
            );
        }

        // Validate rating
        if (rating < 1 || rating > 5) {
            throw new RuntimeException(
                    "Rating must be between 1 and 5"
            );
        }

        // Validate comment
        if (comment == null ||
                comment.trim().isEmpty()) {

            throw new RuntimeException(
                    "Review comment cannot be empty"
            );
        }

        Review review = new Review();

        review.setUserId(userId);

        // Use user's name
        String userName =
                ((user.getFirstname() == null)
                        ? ""
                        : user.getFirstname())
                        + " "
                        + ((user.getLastname() == null)
                        ? ""
                        : user.getLastname());

        review.setUserName(userName.trim());

        review.setTargetType(
                targetType.toUpperCase()
        );

        review.setTargetId(targetId);

        review.setTargetName(targetName);

        review.setRating(rating);

        review.setComment(comment.trim());

        // Add photos if provided
        if (photos != null) {
            review.setPhotos(
                    new ArrayList<>(photos)
            );
        } else {
            review.setPhotos(
                    new ArrayList<>()
            );
        }

        review.setReplies(
                new ArrayList<>()
        );

        review.setHelpfulCount(0);

        review.setFlagged(false);

        review.setModerationStatus("APPROVED");

        String currentTime =
                LocalDateTime.now().toString();

        review.setCreatedAt(currentTime);
        review.setUpdatedAt(currentTime);

        return reviewRepository.save(review);
    }


    // ==========================================
    // GET REVIEWS
    // ==========================================

    public List<Review> getReviews(
            String targetType,
            String targetId,
            String sort,
            Integer rating) {

        String type =
                targetType.toUpperCase();

        List<Review> reviews;

        // Rating filter
        if (rating != null) {

            if (rating < 1 || rating > 5) {
                throw new RuntimeException(
                        "Rating filter must be between 1 and 5"
                );
            }

            reviews =
                    reviewRepository
                            .findByTargetTypeAndTargetIdAndRatingAndModerationStatus(
                                    type,
                                    targetId,
                                    rating,
                                    "APPROVED"
                            );

            return reviews;
        }

        // Sorting
        if ("highest".equalsIgnoreCase(sort)
                || "highest-rated".equalsIgnoreCase(sort)) {

            reviews =
                    reviewRepository
                            .findByTargetTypeAndTargetIdAndModerationStatusOrderByRatingDesc(
                                    type,
                                    targetId,
                                    "APPROVED"
                            );

        } else if ("helpful".equalsIgnoreCase(sort)
                || "most-helpful".equalsIgnoreCase(sort)) {

            reviews =
                    reviewRepository
                            .findByTargetTypeAndTargetIdAndModerationStatusOrderByHelpfulCountDesc(
                                    type,
                                    targetId,
                                    "APPROVED"
                            );

        } else {

            // Default = newest
            reviews =
                    reviewRepository
                            .findByTargetTypeAndTargetIdAndModerationStatusOrderByCreatedAtDesc(
                                    type,
                                    targetId,
                                    "APPROVED"
                            );
        }

        return reviews;
    }


    // ==========================================
    // ADD REPLY
    // ==========================================

    public Review addReply(
            String reviewId,
            String userId,
            String comment) {

        Users user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        Review review =
                reviewRepository.findById(reviewId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Review not found"
                                )
                        );

        if (comment == null ||
                comment.trim().isEmpty()) {

            throw new RuntimeException(
                    "Reply cannot be empty"
            );
        }

        Review.Reply reply =
                new Review.Reply();

        reply.setId(
                UUID.randomUUID().toString()
        );

        reply.setUserId(userId);

        String userName =
                ((user.getFirstname() == null)
                        ? ""
                        : user.getFirstname())
                        + " "
                        + ((user.getLastname() == null)
                        ? ""
                        : user.getLastname());

        reply.setUserName(
                userName.trim()
        );

        reply.setComment(
                comment.trim()
        );

        reply.setCreatedAt(
                LocalDateTime.now().toString()
        );

        if (review.getReplies() == null) {
            review.setReplies(
                    new ArrayList<>()
            );
        }

        review.getReplies().add(reply);

        review.setUpdatedAt(
                LocalDateTime.now().toString()
        );

        return reviewRepository.save(review);
    }


    // ==========================================
    // MARK REVIEW AS HELPFUL
    // ==========================================

    public Review markHelpful(
            String reviewId) {

        Review review =
                reviewRepository.findById(reviewId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Review not found"
                                )
                        );

        review.setHelpfulCount(
                review.getHelpfulCount() + 1
        );

        review.setUpdatedAt(
                LocalDateTime.now().toString()
        );

        return reviewRepository.save(review);
    }


    // ==========================================
    // FLAG REVIEW
    // ==========================================

    public Review flagReview(
            String reviewId,
            String reason) {

        Review review =
                reviewRepository.findById(reviewId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Review not found"
                                )
                        );

        review.setFlagged(true);

        review.setFlagReason(
                reason == null
                        ? "Inappropriate content"
                        : reason.trim()
        );

        // Send to moderator
        review.setModerationStatus("PENDING");

        review.setUpdatedAt(
                LocalDateTime.now().toString()
        );

        return reviewRepository.save(review);
    }


    // ==========================================
    // GET FLAGGED REVIEWS
    // ==========================================

    public List<Review> getFlaggedReviews() {

        return reviewRepository
                .findByFlaggedTrue();
    }


    // ==========================================
    // MODERATE REVIEW
    // ==========================================

    public Review moderateReview(
            String reviewId,
            String status) {

        Review review =
                reviewRepository.findById(reviewId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Review not found"
                                )
                        );

        if (status == null) {
            throw new RuntimeException(
                    "Moderation status is required"
            );
        }

        String moderationStatus =
                status.toUpperCase();

        if (!moderationStatus.equals("APPROVED")
                && !moderationStatus.equals("REMOVED")
                && !moderationStatus.equals("PENDING")) {

            throw new RuntimeException(
                    "Invalid moderation status"
            );
        }

        review.setModerationStatus(
                moderationStatus
        );

        if (moderationStatus.equals("APPROVED")) {
            review.setFlagged(false);
        }

        review.setUpdatedAt(
                LocalDateTime.now().toString()
        );

        return reviewRepository.save(review);
    }
}