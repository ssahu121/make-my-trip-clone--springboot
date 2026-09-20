package com.makemytrip.makemytrip.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

@Document(collection = "users")
public class Users {

    @Id
    private String _id;

    private String firstname;
    private String lastname;
    private String email;
    private String password;
    private String role;
    private String phoneNumber;

    private List<Booking> bookings = new ArrayList<>();


    // =====================================================
    // TASK 4 - SAVED USER PREFERENCES
    // =====================================================

    private List<String> preferredSeats = new ArrayList<>();

    private String preferredRoomType;


    // =====================================================
    // GETTERS AND SETTERS - USER
    // =====================================================

    public String getFirstname() {
        return firstname;
    }

    public String getId() {
        return _id;
    }

    public void setFirstname(String firstname) {
        this.firstname = firstname;
    }

    public String getLastname() {
        return lastname;
    }

    public void setLastname(String lastname) {
        this.lastname = lastname;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public String getPassword() {
        return password;
    }

    public void setFirstName(String firstname) {
        this.firstname = firstname;
    }

    public void setLastName(String lastname) {
        this.lastname = lastname;
    }

    public String getEmail() {
        return email;
    }

    public String getRole() {
        return role;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public List<Booking> getBookings() {
        return bookings;
    }

    public void setBookings(List<Booking> bookings) {
        this.bookings = bookings;
    }


    // =====================================================
    // TASK 4 - PREFERRED SEATS GETTERS / SETTERS
    // =====================================================

    public List<String> getPreferredSeats() {
        return preferredSeats;
    }

    public void setPreferredSeats(List<String> preferredSeats) {
        this.preferredSeats = preferredSeats;
    }


    // =====================================================
    // TASK 4 - PREFERRED ROOM TYPE GETTERS / SETTERS
    // =====================================================

    public String getPreferredRoomType() {
        return preferredRoomType;
    }

    public void setPreferredRoomType(String preferredRoomType) {
        this.preferredRoomType = preferredRoomType;
    }


    // =====================================================
    // BOOKING CLASS
    // =====================================================

    public static class Booking {

        private String type;
        private String bookingId;
        private String date;
        private int quantity;
        private double totalPrice;

        private String bookingStatus = "CONFIRMED";


        // =================================================
        // CANCELLATION / REFUND
        // =================================================

        private String cancellationReason;
        private double refundAmount;
        private String refundStatus;
        private String refundExpectedDate;
        private String cancelledAt;
        private String bookingTime;


        // =================================================
        // TASK 4 - FLIGHT SEAT SELECTION
        // =================================================

        private List<String> selectedSeats =
                new ArrayList<>();


        // =================================================
        // TASK 4 - HOTEL ROOM SELECTION
        // =================================================

        private String selectedRoomType;


        // =================================================
        // GETTERS AND SETTERS
        // =================================================

        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }


        public String getBookingId() {
            return bookingId;
        }

        public void setBookingId(String bookingId) {
            this.bookingId = bookingId;
        }


        public String getDate() {
            return date;
        }

        public void setDate(String date) {
            this.date = date;
        }


        public int getQuantity() {
            return quantity;
        }

        public void setQuantity(int quantity) {
            this.quantity = quantity;
        }


        public double getTotalPrice() {
            return totalPrice;
        }

        public void setTotalPrice(double totalPrice) {
            this.totalPrice = totalPrice;
        }


        public String getBookingStatus() {
            return bookingStatus;
        }

        public void setBookingStatus(String bookingStatus) {
            this.bookingStatus = bookingStatus;
        }


        // =================================================
        // CANCELLATION / REFUND GETTERS SETTERS
        // =================================================

        public String getCancellationReason() {
            return cancellationReason;
        }

        public void setCancellationReason(
                String cancellationReason) {

            this.cancellationReason =
                    cancellationReason;
        }


        public double getRefundAmount() {
            return refundAmount;
        }

        public void setRefundAmount(double refundAmount) {
            this.refundAmount = refundAmount;
        }


        public String getRefundStatus() {
            return refundStatus;
        }

        public void setRefundStatus(String refundStatus) {
            this.refundStatus = refundStatus;
        }


        public String getRefundExpectedDate() {
            return refundExpectedDate;
        }

        public void setRefundExpectedDate(
                String refundExpectedDate) {

            this.refundExpectedDate =
                    refundExpectedDate;
        }


        public String getCancelledAt() {
            return cancelledAt;
        }

        public void setCancelledAt(String cancelledAt) {
            this.cancelledAt = cancelledAt;
        }


        public String getBookingTime() {
            return bookingTime;
        }

        public void setBookingTime(String bookingTime) {
            this.bookingTime = bookingTime;
        }


        // =================================================
        // SELECTED FLIGHT SEATS
        // =================================================

        public List<String> getSelectedSeats() {
            return selectedSeats;
        }

        public void setSelectedSeats(
                List<String> selectedSeats) {

            this.selectedSeats = selectedSeats;
        }


        // =================================================
        // SELECTED HOTEL ROOM TYPE
        // =================================================

        public String getSelectedRoomType() {
            return selectedRoomType;
        }

        public void setSelectedRoomType(
                String selectedRoomType) {

            this.selectedRoomType =
                    selectedRoomType;
        }
    }
}