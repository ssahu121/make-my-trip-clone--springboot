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
import java.util.Optional;

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
            double price) {

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

        if (flight.getAvailableSeats() < seats) {
            throw new RuntimeException(
                    "Not enough seats available"
            );
        }

        // Reduce available seats
        flight.setAvailableSeats(
                flight.getAvailableSeats() - seats
        );

        flightRepository.save(flight);

        // Create booking
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
        booking.setTotalPrice(price);

        // Default status
        booking.setBookingStatus("CONFIRMED");

        // Add booking to user
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
            double price) {

        Optional<Users> userOptional =
                userRepository.findById(userId);

        Optional<Hotel> hotelOptional =
                hotelRepository.findById(hotelId);

        if (userOptional.isEmpty()) {
            throw new RuntimeException("User not found");
        }

        if (hotelOptional.isEmpty()) {
            throw new RuntimeException("Hotel not found");
        }

        Users user = userOptional.get();
        Hotel hotel = hotelOptional.get();

        if (hotel.getAvailableRooms() < rooms) {
            throw new RuntimeException(
                    "Not enough rooms available"
            );
        }

        // Reduce available rooms
        hotel.setAvailableRooms(
                hotel.getAvailableRooms() - rooms
        );

        hotelRepository.save(hotel);

        // Create booking
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
        booking.setTotalPrice(price);

        // Default status
        booking.setBookingStatus("CONFIRMED");

        // Add booking
        user.getBookings().add(booking);

        userRepository.save(user);

        return booking;
    }


    // =====================================================
    // CANCEL BOOKING + REFUND
    // =====================================================

    public Booking cancelBooking(
            String userId,
            String bookingId,
            String reason) {

        // -------------------------------------------------
        // Find user
        // -------------------------------------------------

        Optional<Users> userOptional =
                userRepository.findById(userId);

        if (userOptional.isEmpty()) {
            throw new RuntimeException(
                    "User not found: " + userId
            );
        }

        Users user = userOptional.get();

        // -------------------------------------------------
        // Check bookings
        // -------------------------------------------------

        if (user.getBookings() == null ||
                user.getBookings().isEmpty()) {

            throw new RuntimeException(
                    "No bookings found for this user"
            );
        }


        // -------------------------------------------------
        // Find booking
        // -------------------------------------------------

        for (Booking booking : user.getBookings()) {

            if (booking == null) {
                continue;
            }

            if (booking.getBookingId() == null) {
                continue;
            }

            if (!booking.getBookingId().equals(bookingId)) {
                continue;
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


            /*
             * Old bookings may not contain bookingTime.
             * Therefore we DO NOT throw an exception.
             */

            if (bookingTimeString != null &&
                    !bookingTimeString.isBlank()) {

                try {

                    LocalDateTime bookingTime =
                            LocalDateTime.parse(
                                    bookingTimeString
                            );

                    LocalDateTime cancellationTime =
                            LocalDateTime.now();

                    long hours =
                            Duration.between(
                                    bookingTime,
                                    cancellationTime
                            ).toHours();


                    // -------------------------------------
                    // Refund policy
                    // Within 24 hours = 50%
                    // -------------------------------------

                    if (hours >= 0 && hours <= 24) {

                        refundAmount =
                                booking.getTotalPrice()
                                        * 0.50;
                    }

                } catch (Exception e) {

                    /*
                     * Invalid old booking time.
                     * Don't crash cancellation API.
                     */

                    System.out.println(
                            "Invalid bookingTime for booking: "
                                    + bookingId
                    );

                    System.out.println(
                            "bookingTime = "
                                    + bookingTimeString
                    );

                    /*
                     * Keep refund as 0 for invalid
                     * booking time.
                     */
                    refundAmount = 0.0;
                }

            } else {

                /*
                 * Old booking without bookingTime.
                 */

                System.out.println(
                        "BookingTime missing for booking: "
                                + bookingId
                );

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

            booking.setRefundStatus(
                    "PENDING"
            );

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

                    flight.setAvailableSeats(
                            flight.getAvailableSeats()
                                    + booking.getQuantity()
                    );

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


        // -------------------------------------------------
        // Booking not found
        // -------------------------------------------------

        throw new RuntimeException(
                "Booking not found: " + bookingId
        );
    }
}