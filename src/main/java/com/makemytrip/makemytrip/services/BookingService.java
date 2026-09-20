package com.makemytrip.makemytrip.services;

import com.makemytrip.makemytrip.models.Users;
import com.makemytrip.makemytrip.models.Users.Booking;
import com.makemytrip.makemytrip.models.Flight;
import com.makemytrip.makemytrip.models.Hotel;
import com.makemytrip.makemytrip.repositories.UserRepository;
import com.makemytrip.makemytrip.repositories.FlightRepository;
import com.makemytrip.makemytrip.repositories.HotelRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class BookingService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FlightRepository flightRepository;

    @Autowired
    private HotelRepository hotelRepository;


    // =====================================================
    // FLIGHT BOOKING
    // =====================================================

    public Booking bookFlight(
            String userId,
            String flightId,
            int seats,
            double price,
            String selectedSeats) {

        Optional<Users> userOptional =
                userRepository.findById(userId);

        Optional<Flight> flightOptional =
                flightRepository.findById(flightId);

        if (userOptional.isEmpty()) {
            throw new RuntimeException("User not found");
        }

        if (flightOptional.isEmpty()) {
            throw new RuntimeException("Flight not found");
        }

        Users user = userOptional.get();
        Flight flight = flightOptional.get();


        // =================================================
        // Initialize seat data
        // =================================================

        if (flight.getBookedSeats() == null) {
            flight.setBookedSeats(new ArrayList<>());
        }

        if (flight.getPremiumSeats() == null) {
            flight.setPremiumSeats(new ArrayList<>());
        }

        if (flight.getPremiumSeatPrice() <= 0) {
            flight.setPremiumSeatPrice(500);
        }


        // =================================================
        // Validate number of seats
        // =================================================

        if (seats <= 0) {
            throw new RuntimeException(
                    "Number of seats must be greater than 0"
            );
        }

        if (flight.getAvailableSeats() < seats) {
            throw new RuntimeException(
                    "Not enough seats available"
            );
        }


        // =================================================
        // Process selected seats
        // =================================================

        List<String> selectedSeatList =
                new ArrayList<>();

        if (selectedSeats != null &&
                !selectedSeats.trim().isEmpty()) {

            String[] seatArray =
                    selectedSeats.split(",");

            for (String seat : seatArray) {

                String seatNumber =
                        seat.trim();

                if (!seatNumber.isEmpty() &&
                        !selectedSeatList.contains(seatNumber)) {

                    selectedSeatList.add(seatNumber);
                }
            }
        }


        // =================================================
        // Validate selected seat count
        // =================================================

        if (!selectedSeatList.isEmpty() &&
                selectedSeatList.size() != seats) {

            throw new RuntimeException(
                    "Selected seats count must match number of seats"
            );
        }


        // =================================================
        // Prevent duplicate seats in request
        // =================================================

        if (selectedSeatList.size() !=
                new HashSet<>(selectedSeatList).size()) {

            throw new RuntimeException(
                    "Duplicate seats are not allowed"
            );
        }


        // =================================================
        // Check already booked seats
        // =================================================

        for (String seat : selectedSeatList) {

            if (flight.getBookedSeats()
                    .contains(seat)) {

                throw new RuntimeException(
                        "Seat already booked: " + seat
                );
            }
        }


        // =================================================
        // Calculate premium seat price
        // =================================================

        double premiumAmount = 0.0;

        for (String seat : selectedSeatList) {

            if (flight.getPremiumSeats()
                    .contains(seat)) {

                premiumAmount +=
                        flight.getPremiumSeatPrice();
            }
        }


        // =================================================
        // Add selected seats to booked seats
        // =================================================

        flight.getBookedSeats()
                .addAll(selectedSeatList);


        // =================================================
        // Reduce available seats
        // =================================================

        int remainingSeats =
                flight.getAvailableSeats() - seats;

        if (remainingSeats < 0) {
            throw new RuntimeException(
                    "Available seats cannot be negative"
            );
        }

        flight.setAvailableSeats(
                remainingSeats
        );


        // =================================================
        // Save updated flight
        // =================================================

        flightRepository.save(flight);


        // =================================================
        // Create flight booking
        // =================================================

        Booking booking = new Booking();

        booking.setType("Flight");

        booking.setBookingId(flightId);

        booking.setDate(
                LocalDate.now().toString()
        );

        booking.setBookingTime(
                LocalDateTime.now().toString()
        );

        booking.setQuantity(seats);


        // =================================================
        // Save selected seats inside booking
        // =================================================

        booking.setSelectedSeats(
                new ArrayList<>(selectedSeatList)
        );


        // =================================================
        // Base price + premium seat charges
        // =================================================

        booking.setTotalPrice(
                price + premiumAmount
        );

        booking.setBookingStatus(
                "CONFIRMED"
        );


        // =================================================
        // Add booking to user
        // =================================================

        if (user.getBookings() == null) {
            user.setBookings(new ArrayList<>());
        }

        user.getBookings().add(booking);

        userRepository.save(user);

        return booking;
    }


    // =====================================================
    // HOTEL BOOKING
    // =====================================================

    public Booking bookhotel(
            String userId,
            String hotelId,
            int rooms,
            double price,
            String roomType) {

        Optional<Users> userOptional =
                userRepository.findById(userId);

        Optional<Hotel> hotelOptional =
                hotelRepository.findById(hotelId);

        if (userOptional.isEmpty()) {
            throw new RuntimeException(
                    "User not found"
            );
        }

        if (hotelOptional.isEmpty()) {
            throw new RuntimeException(
                    "Hotel not found"
            );
        }

        Users user = userOptional.get();
        Hotel hotel = hotelOptional.get();


        // =================================================
        // Validate number of rooms
        // =================================================

        if (rooms <= 0) {
            throw new RuntimeException(
                    "Number of rooms must be greater than 0"
            );
        }

        if (hotel.getAvailableRooms() < rooms) {
            throw new RuntimeException(
                    "Not enough rooms available"
            );
        }


        // =================================================
        // Initialize room type data
        // =================================================

        if (hotel.getRoomTypes() == null ||
                hotel.getRoomTypes().isEmpty()) {

            hotel.setRoomTypes(
                    new ArrayList<>(
                            Arrays.asList(
                                    "Standard",
                                    "Deluxe",
                                    "Suite"
                            )
                    )
            );
        }


        // =================================================
        // Initialize premium room types
        // =================================================

        if (hotel.getPremiumRoomTypes() == null ||
                hotel.getPremiumRoomTypes().isEmpty()) {

            hotel.setPremiumRoomTypes(
                    new ArrayList<>(
                            Arrays.asList(
                                    "Deluxe",
                                    "Suite"
                            )
                    )
            );
        }


        // =================================================
        // Initialize premium room price
        // =================================================

        if (hotel.getPremiumRoomPrice() <= 0) {
            hotel.setPremiumRoomPrice(1000);
        }


        // =================================================
        // Validate room type
        // =================================================

        if (roomType == null ||
                roomType.trim().isEmpty()) {

            roomType = "Standard";
        }

        roomType = roomType.trim();


        if (!hotel.getRoomTypes()
                .contains(roomType)) {

            throw new RuntimeException(
                    "Invalid room type: " + roomType
            );
        }


        // =================================================
        // Calculate premium room price
        // =================================================

        double premiumAmount = 0.0;

        if (hotel.getPremiumRoomTypes()
                .contains(roomType)) {

            premiumAmount =
                    hotel.getPremiumRoomPrice() * rooms;
        }


        // =================================================
        // Calculate final hotel price
        // =================================================

        double finalPrice =
                price + premiumAmount;


        // =================================================
        // Reduce available rooms
        // =================================================

        int remainingRooms =
                hotel.getAvailableRooms() - rooms;

        if (remainingRooms < 0) {
            throw new RuntimeException(
                    "Available rooms cannot be negative"
            );
        }

        hotel.setAvailableRooms(
                remainingRooms
        );


        // =================================================
        // Save updated hotel
        // =================================================

        hotelRepository.save(hotel);


        // =================================================
        // Create hotel booking
        // =================================================

        Booking booking = new Booking();

        booking.setType("Hotel");

        booking.setBookingId(hotelId);

        booking.setDate(
                LocalDate.now().toString()
        );

        booking.setBookingTime(
                LocalDateTime.now().toString()
        );

        booking.setQuantity(rooms);


        // =================================================
        // Save selected room type
        // =================================================

        booking.setSelectedRoomType(roomType);


        // =================================================
        // Base price + premium room charges
        // =================================================

        booking.setTotalPrice(finalPrice);

        booking.setBookingStatus(
                "CONFIRMED"
        );


        // =================================================
        // Add booking to user
        // =================================================

        if (user.getBookings() == null) {
            user.setBookings(new ArrayList<>());
        }

        user.getBookings().add(booking);

        userRepository.save(user);

        return booking;
    }


    // =====================================================
    // SAVE USER PREFERENCES
    // =====================================================

    public Users savePreferences(
            String userId,
            String preferredSeats,
            String preferredRoomType) {

        Optional<Users> userOptional =
                userRepository.findById(userId);

        if (userOptional.isEmpty()) {
            throw new RuntimeException(
                    "User not found: " + userId
            );
        }

        Users user = userOptional.get();


        // =================================================
        // Save preferred flight seats
        // =================================================

        if (preferredSeats != null &&
                !preferredSeats.trim().isEmpty()) {

            List<String> seats =
                    Arrays.stream(
                                    preferredSeats.split(",")
                            )
                            .map(String::trim)
                            .filter(s -> !s.isEmpty())
                            .collect(Collectors.toList());

            user.setPreferredSeats(seats);
        }


        // =================================================
        // Save preferred hotel room type
        // =================================================

        if (preferredRoomType != null &&
                !preferredRoomType.trim().isEmpty()) {

            user.setPreferredRoomType(
                    preferredRoomType.trim()
            );
        }


        // =================================================
        // Save user in MongoDB
        // =================================================

        return userRepository.save(user);
    }


    // =====================================================
    // CANCEL BOOKING + REFUND
    // =====================================================

    public Booking cancelBooking(
            String userId,
            String bookingId,
            String reason) {

        Optional<Users> userOptional =
                userRepository.findById(userId);

        if (userOptional.isEmpty()) {
            throw new RuntimeException(
                    "User not found: " + userId
            );
        }

        Users user = userOptional.get();

        if (user.getBookings() == null ||
                user.getBookings().isEmpty()) {

            throw new RuntimeException(
                    "No bookings found for this user"
            );
        }


        for (Booking booking : user.getBookings()) {

            if (booking == null) {
                continue;
            }

            if (booking.getBookingId() == null) {
                continue;
            }

            if (!booking.getBookingId()
                    .equals(bookingId)) {
                continue;
            }


            // =============================================
            // Validate cancellation reason
            // =============================================

            List<String> allowedReasons =
                    Arrays.asList(
                            "Change of plans",
                            "Found a better price",
                            "Travel dates changed",
                            "Flight schedule changed",
                            "Booked by mistake",
                            "Personal reasons",
                            "Other"
                    );

            if (reason == null ||
                    !allowedReasons.contains(reason)) {

                throw new RuntimeException(
                        "Invalid cancellation reason"
                );
            }


            // =============================================
            // Already cancelled
            // =============================================

            if ("CANCELLED".equals(
                    booking.getBookingStatus())) {

                return booking;
            }


            // =============================================
            // Calculate refund
            // =============================================

            double refundAmount = 0.0;

            String bookingTimeString =
                    booking.getBookingTime();

            if (bookingTimeString != null &&
                    !bookingTimeString.isBlank()) {

                try {

                    LocalDateTime bookingTime =
                            LocalDateTime.parse(
                                    bookingTimeString
                            );

                    LocalDateTime cancellationTime =
                            LocalDateTime.now();

                    long minutes =
                            Duration.between(
                                    bookingTime,
                                    cancellationTime
                            ).toMinutes();


                    // Within or equal to 24 hours = 50%
                    if (minutes >= 0 &&
                            minutes <= 24 * 60) {

                        refundAmount =
                                booking.getTotalPrice()
                                        * 0.50;
                    }

                } catch (Exception e) {

                    System.out.println(
                            "Invalid bookingTime for booking: "
                                    + bookingId
                    );

                    refundAmount = 0.0;
                }

            } else {

                refundAmount = 0.0;
            }


            // =============================================
            // Update cancellation information
            // =============================================

            LocalDateTime cancellationTime =
                    LocalDateTime.now();

            booking.setBookingStatus(
                    "CANCELLED"
            );

            booking.setCancellationReason(
                    reason
            );

            booking.setRefundAmount(
                    refundAmount
            );


            if (refundAmount > 0) {

                booking.setRefundStatus(
                        "PENDING"
                );

            } else {

                booking.setRefundStatus(
                        "NOT_APPLICABLE"
                );
            }


            booking.setCancelledAt(
                    cancellationTime.toString()
            );

            booking.setRefundExpectedDate(
                    LocalDate.now()
                            .plusDays(5)
                            .toString()
            );


            // =============================================
            // Restore Flight Seats
            // =============================================

            if ("Flight".equalsIgnoreCase(
                    booking.getType())) {

                Optional<Flight> flightOptional =
                        flightRepository.findById(
                                booking.getBookingId()
                        );

                if (flightOptional.isPresent()) {

                    Flight flight =
                            flightOptional.get();


                    // Restore available seat count
                    flight.setAvailableSeats(
                            flight.getAvailableSeats()
                                    + booking.getQuantity()
                    );


                    // Release selected seats
                    if (booking.getSelectedSeats() != null &&
                            flight.getBookedSeats() != null) {

                        flight.getBookedSeats()
                                .removeAll(
                                        booking.getSelectedSeats()
                                );
                    }

                    flightRepository.save(flight);
                }
            }


            // =============================================
            // Restore Hotel Rooms
            // =============================================

            if ("Hotel".equalsIgnoreCase(
                    booking.getType())) {

                Optional<Hotel> hotelOptional =
                        hotelRepository.findById(
                                booking.getBookingId()
                        );

                if (hotelOptional.isPresent()) {

                    Hotel hotel =
                            hotelOptional.get();

                    hotel.setAvailableRooms(
                            hotel.getAvailableRooms()
                                    + booking.getQuantity()
                    );

                    hotelRepository.save(hotel);
                }
            }


            // =============================================
            // Save User
            // =============================================

            userRepository.save(user);

            return booking;
        }


        throw new RuntimeException(
                "Booking not found: " + bookingId
        );
    }


    // =====================================================
    // UPDATE REFUND STATUS
    // =====================================================

    public Booking updateRefundStatus(
            String userId,
            String bookingId,
            String status) {

        Optional<Users> userOptional =
                userRepository.findById(userId);

        if (userOptional.isEmpty()) {
            return null;
        }

        Users user = userOptional.get();

        if (user.getBookings() == null) {
            return null;
        }


        for (Booking booking :
                user.getBookings()) {

            if (booking == null) {
                continue;
            }

            if (booking.getBookingId() == null) {
                continue;
            }

            if (!booking.getBookingId()
                    .equals(bookingId)) {
                continue;
            }


            // =============================================
            // Validate refund status
            // =============================================

            if (!"PENDING".equals(status)
                    && !"PROCESSED".equals(status)
                    && !"COMPLETED".equals(status)
                    && !"NOT_APPLICABLE".equals(status)) {

                throw new RuntimeException(
                        "Invalid refund status"
                );
            }


            booking.setRefundStatus(status);

            userRepository.save(user);

            return booking;
        }

        return null;
    }
}