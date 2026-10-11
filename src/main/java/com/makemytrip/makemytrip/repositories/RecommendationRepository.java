
package com.makemytrip.makemytrip.repositories;

import com.makemytrip.makemytrip.models.Recommendation;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface RecommendationRepository
        extends MongoRepository<Recommendation, String> {

    // Get all recommendations for a user, highest score first
    List<Recommendation> findByUserIdOrderByScoreDesc(String userId);

    // Get recommendations by type: HOTEL, FLIGHT, DESTINATION
    List<Recommendation> findByUserIdAndItemTypeOrderByScoreDesc(
            String userId,
            String itemType
    );

    // Find a particular recommendation belonging to a user
    Optional<Recommendation> findByIdAndUserId(
            String id,
            String userId
    );

    // Find a recommendation by user and recommended item
    Optional<Recommendation> findByUserIdAndItemTypeAndItemId(
            String userId,
            String itemType,
            String itemId
    );

    // Get recommendations marked as helpful or irrelevant
    List<Recommendation> findByUserIdAndFeedback(
            String userId,
            String feedback
    );
}
