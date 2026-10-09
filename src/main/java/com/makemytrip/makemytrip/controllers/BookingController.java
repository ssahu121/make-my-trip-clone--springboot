package com.makemytrip.makemytrip.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.makemytrip.makemytrip.models.Users;
import com.makemytrip.makemytrip.services.BookingService;

@RestController
@RequestMapping("/booking")
public class BookingController {

    @Autowired
    private BookingService bookingService;


    // ========================
    // Test Booking Controller
    // ========================
    @GetMapping("/test")
    public String testBookingController() {
        return "Booking Controller Working";
    }


    // =========================
    // Test Cancel Endpoint
    // =========================
    @PutMapping("/cancel-test")
    public String cancelTest() {
        return "Cancel endpoint working";
    }


    // =========================
    // Flight Booking
    // =========================
    @PostMapping("/flight")
    public Users.Booking bookFlight(
            @RequestParam String userId,
            @RequestParam String flightId,
            @RequestParam int seats,
            @RequestParam double price,
            @RequestParam(required = false) String selectedSeats) {

        return bookingService.bookFlight(
                userId,
                flightId,
                seats,
                price,
                selectedSeats
        );
    }


    // =========================
    // Hotel Booking
    // =========================
    @PostMapping("/hotel")
    public Users.Booking bookHotel(
            @RequestParam String userId,
            @RequestParam String hotelId,
            @RequestParam int rooms,
            @RequestParam double price,
            @RequestParam(required = false) String roomType) {

        return bookingService.bookhotel(
                userId,
                hotelId,
                rooms,
                price,
                roomType
        );
    }


    // =========================
    // Cancel Booking + Refund
    // =========================
    @PutMapping("/cancel")
    public ResponseEntity<Users.Booking> cancelBooking(
            @RequestParam String userId,
            @RequestParam String bookingId,
            @RequestParam String reason) {

        Users.Booking booking =
                bookingService.cancelBooking(
                        userId,
                        bookingId,
                        reason
                );

        if (booking == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(booking);
    }


    // =========================
    // Update Refund Status
    // =========================
    @PutMapping("/refund-status")
    public ResponseEntity<Users.Booking> updateRefundStatus(
            @RequestParam String userId,
            @RequestParam String bookingId,
            @RequestParam String status) {

        Users.Booking booking =
                bookingService.updateRefundStatus(
                        userId,
                        bookingId,
                        status
                );

        if (booking == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(booking);
    }


    // =========================
    // Save User Preferences
    // =========================
    @PutMapping("/preferences")
    public Users savePreferences(
            @RequestParam String userId,
            @RequestParam(required = false) String preferredSeats,
            @RequestParam(required = false) String preferredRoomType) {

        return bookingService.savePreferences(
                userId,
                preferredSeats,
                preferredRoomType
        );
    }
}