package com.makemytrip.makemytrip.models;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection="hotels")
    public class Hotel{
    @Id
    private String _id;
    private String hotelName ;
    private String location;
    private double pricePerNight;
    private int availableRooms;
    private String amenities;

     // Getters and Setters
    public String getId() {
        return _id;
    }

    public void setId(String id) {
        this._id = id;
    }

    public void setAmenities(String amenities) {
        this.amenities = amenities;
    }

    public String getAmenities() {
        return amenities;
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

    public int getAvailableRooms() {
        return availableRooms;
    }

    public void setAvailableRooms(int availableRooms) {
        this.availableRooms = availableRooms;
    }

    public double getPricePerNight() {
        return pricePerNight;
    }

    public void setPricePerNight(double pricePerNight) {
        this.pricePerNight = pricePerNight;
    }

//    public String gethotelName() {
//        // TODO Auto-generated method stub
//        return hotelName;
////        throw new UnsupportedOperationException("Unimplemented method 'gethotelName'");
//    }
//
//    public void sethotelName(Object gethotelName) {
//        // TODO Auto-generated method stub
//        throw new UnsupportedOperationException("Unimplemented method 'sethotelName'");
//    }
//
//    public String getamenities() {
//        // TODO Auto-generated method stub
//        return amenities;
////        throw new UnsupportedOperationException("Unimplemented method 'getamenities'");
//    }
//
//    public void setamenities(Object getamenities) {
//        // TODO Auto-generated method stub
//        throw new UnsupportedOperationException("Unimplemented method 'setamenities'");
//    }
}