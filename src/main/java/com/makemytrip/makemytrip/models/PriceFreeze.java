package com.makemytrip.makemytrip.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "price_freeze")
public class PriceFreeze {

    @Id
    private String id;

    private String flightId;
    private String flightName;
    private double frozenPrice;
    private String freezeStartTime;
    private String freezeExpiryTime;
    private boolean active;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getFlightId() {
        return flightId;
    }

    public void setFlightId(String flightId) {
        this.flightId = flightId;
    }

    public String getFlightName() {
        return flightName;
    }

    public void setFlightName(String flightName) {
        this.flightName = flightName;
    }

    public double getFrozenPrice() {
        return frozenPrice;
    }

    public void setFrozenPrice(double frozenPrice) {
        this.frozenPrice = frozenPrice;
    }

    public String getFreezeStartTime() {
        return freezeStartTime;
    }

    public void setFreezeStartTime(String freezeStartTime) {
        this.freezeStartTime = freezeStartTime;
    }

    public String getFreezeExpiryTime() {
        return freezeExpiryTime;
    }

    public void setFreezeExpiryTime(String freezeExpiryTime) {
        this.freezeExpiryTime = freezeExpiryTime;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}