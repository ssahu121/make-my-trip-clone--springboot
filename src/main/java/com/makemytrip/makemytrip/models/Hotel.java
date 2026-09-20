package com.makemytrip.makemytrip.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

@Document(collection = "hotels")
public class Hotel {

    @Id
    private String _id;

    private String hotelName;
    private String location;
    private double pricePerNight;
    private int availableRooms;
    private String amenities;


    // =====================================================
    // TASK 4 - ROOM SELECTION
    // =====================================================

    // Available room types
    private List<String> roomTypes = new ArrayList<>();

    // Premium / upgraded room types
    private List<String> premiumRoomTypes = new ArrayList<>();

    // Extra price for premium/upgraded rooms
    private double premiumRoomPrice = 1000;


    // =====================================================
    // GETTERS AND SETTERS
    // =====================================================

    public String getId() {
        return _id;
    }

    public void setId(String id) {
        this._id = id;
    }


    public String getHotelName() {
        return hotelName;
    }

    public void setHotelName(String hotelName) {
        this.hotelName = hotelName;
    }


    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }


    public double getPricePerNight() {
        return pricePerNight;
    }

    public void setPricePerNight(double pricePerNight) {
        this.pricePerNight = pricePerNight;
    }


    public int getAvailableRooms() {
        return availableRooms;
    }

    public void setAvailableRooms(int availableRooms) {
        this.availableRooms = availableRooms;
    }


    public String getAmenities() {
        return amenities;
    }

    public void setAmenities(String amenities) {
        this.amenities = amenities;
    }


    // =====================================================
    // ROOM TYPE GETTER / SETTER
    // =====================================================

    public List<String> getRoomTypes() {
        return roomTypes;
    }

    public void setRoomTypes(List<String> roomTypes) {
        this.roomTypes = roomTypes;
    }


    // =====================================================
    // PREMIUM ROOM TYPE GETTER / SETTER
    // =====================================================

    public List<String> getPremiumRoomTypes() {
        return premiumRoomTypes;
    }

    public void setPremiumRoomTypes(
            List<String> premiumRoomTypes) {

        this.premiumRoomTypes = premiumRoomTypes;
    }


    // =====================================================
    // PREMIUM ROOM PRICE GETTER / SETTER
    // =====================================================

    public double getPremiumRoomPrice() {
        return premiumRoomPrice;
    }

    public void setPremiumRoomPrice(
            double premiumRoomPrice) {

        this.premiumRoomPrice = premiumRoomPrice;
    }
}