package com.makemytrip.makemytrip.repositories;

import com.makemytrip.makemytrip.models.Review;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ReviewRepository extends MongoRepository<Review, String> {

    // Get all reviews for a particular hotel/flight
    List<Review> findByTargetTypeAndTargetIdAndModerationStatus(
            String targetType,
            String targetId,
            String moderationStatus
    );

    // Get reviews of a particular user
    List<Review> findByUserId(String userId);

    // Get flagged reviews for moderator
    List<Review> findByFlaggedTrue();

    // Get reviews by moderation status
    List<Review> findByModerationStatus(String moderationStatus);

    // Get reviews by rating
    List<Review> findByTargetTypeAndTargetIdAndRatingAndModerationStatus(
            String targetType,
            String targetId,
            int rating,
            String moderationStatus
    );

    // Newest reviews
    List<Review> findByTargetTypeAndTargetIdAndModerationStatusOrderByCreatedAtDesc(
            String targetType,
            String targetId,
            String moderationStatus
    );

    // Highest rated reviews
    List<Review> findByTargetTypeAndTargetIdAndModerationStatusOrderByRatingDesc(
            String targetType,
            String targetId,
            String moderationStatus
    );

    // Most helpful reviews
    List<Review> findByTargetTypeAndTargetIdAndModerationStatusOrderByHelpfulCountDesc(
            String targetType,
            String targetId,
            String moderationStatus
    );
}