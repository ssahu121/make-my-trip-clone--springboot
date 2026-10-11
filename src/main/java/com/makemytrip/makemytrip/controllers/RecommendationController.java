
package com.makemytrip.makemytrip.controllers;

import com.makemytrip.makemytrip.models.Recommendation;
import com.makemytrip.makemytrip.services.RecommendationService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/recommendations")
@CrossOrigin(origins = "http://localhost:3000")
public class RecommendationController {

    private final RecommendationService recommendationService;

    public RecommendationController(
            RecommendationService recommendationService) {
        this.recommendationService = recommendationService;
    }

    // Get personalized recommendations for a user
    @GetMapping
    public ResponseEntity<List<Recommendation>> getRecommendations(
            @RequestParam String userId) {

        List<Recommendation> recommendations =
                recommendationService.getRecommendations(userId);

        return ResponseEntity.ok(recommendations);
    }

    // Simple endpoint to verify the controller
    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok(
                "Recommendation Controller Working"
        );
    }

    @PutMapping("/feedback")
    public ResponseEntity<Recommendation> submitFeedback(
            @RequestParam String userId,
            @RequestParam String recommendationId,
            @RequestParam String feedback) {

        Recommendation result = recommendationService.submitFeedback(
                userId, recommendationId, feedback
        );

        return ResponseEntity.ok(result);
    }

}
