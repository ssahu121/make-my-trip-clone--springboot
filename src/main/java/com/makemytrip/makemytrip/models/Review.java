package com.makemytrip.makemytrip.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

@Document(collection = "reviews")
public class Review {

    @Id
    private String id;

    // ==========================================
    // REVIEW TARGET
    // ==========================================

    // HOTEL or FLIGHT
    private String targetType;

    // Hotel ID or Flight ID
    private String targetId;

    // Hotel name or Flight name
    // Stored so review can still display
    // useful information easily.
    private String targetName;


    // ==========================================
    // USER INFORMATION
    // ==========================================

    private String userId;
    private String userName;


    // ==========================================
    // RATING & REVIEW
    // ==========================================

    // Rating from 1 to 5
    private int rating;

    private String comment;


    // ==========================================
    // REVIEW PHOTOS
    // ==========================================

    // Photo URLs
    private List<String> photos = new ArrayList<>();


    // ==========================================
    // REVIEW REPLIES
    // ==========================================

    private List<Reply> replies = new ArrayList<>();


    // ==========================================
    // HELPFUL COUNT
    // ==========================================

    private int helpfulCount = 0;


    // ==========================================
    // MODERATION
    // ==========================================

    private boolean flagged = false;

    private String flagReason;

    // PENDING / APPROVED / REMOVED
    private String moderationStatus = "APPROVED";


    // ==========================================
    // DATE
    // ==========================================

    private String createdAt;

    private String updatedAt;


    // ==========================================
    // GETTERS & SETTERS
    // ==========================================

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }


    public String getTargetType() {
        return targetType;
    }

    public void setTargetType(String targetType) {
        this.targetType = targetType;
    }


    public String getTargetId() {
        return targetId;
    }

    public void setTargetId(String targetId) {
        this.targetId = targetId;
    }


    public String getTargetName() {
        return targetName;
    }

    public void setTargetName(String targetName) {
        this.targetName = targetName;
    }


    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }


    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }


    public int getRating() {
        return rating;
    }

    public void setRating(int rating) {
        this.rating = rating;
    }


    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }


    public List<String> getPhotos() {
        return photos;
    }

    public void setPhotos(List<String> photos) {
        this.photos = photos;
    }


    public List<Reply> getReplies() {
        return replies;
    }

    public void setReplies(List<Reply> replies) {
        this.replies = replies;
    }


    public int getHelpfulCount() {
        return helpfulCount;
    }

    public void setHelpfulCount(int helpfulCount) {
        this.helpfulCount = helpfulCount;
    }


    public boolean isFlagged() {
        return flagged;
    }

    public void setFlagged(boolean flagged) {
        this.flagged = flagged;
    }


    public String getFlagReason() {
        return flagReason;
    }

    public void setFlagReason(String flagReason) {
        this.flagReason = flagReason;
    }


    public String getModerationStatus() {
        return moderationStatus;
    }

    public void setModerationStatus(String moderationStatus) {
        this.moderationStatus = moderationStatus;
    }


    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }


    public String getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(String updatedAt) {
        this.updatedAt = updatedAt;
    }


    // ==========================================
    // REPLY CLASS
    // ==========================================

    public static class Reply {

        private String id;

        private String userId;

        private String userName;

        private String comment;

        private String createdAt;


        public String getId() {
            return id;
        }

        public void setId(String id) {
            this.id = id;
        }


        public String getUserId() {
            return userId;
        }

        public void setUserId(String userId) {
            this.userId = userId;
        }


        public String getUserName() {
            return userName;
        }

        public void setUserName(String userName) {
            this.userName = userName;
        }


        public String getComment() {
            return comment;
        }

        public void setComment(String comment) {
            this.comment = comment;
        }


        public String getCreatedAt() {
            return createdAt;
        }

        public void setCreatedAt(String createdAt) {
            this.createdAt = createdAt;
        }
    }
}