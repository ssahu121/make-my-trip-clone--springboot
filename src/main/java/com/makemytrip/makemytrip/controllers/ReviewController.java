package com.makemytrip.makemytrip.controllers;

import com.makemytrip.makemytrip.models.Review;
import com.makemytrip.makemytrip.services.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/reviews")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;


    // ==========================================
    // CREATE REVIEW
    // ==========================================

    @PostMapping
    public ResponseEntity<Review> createReview(
            @RequestParam String userId,
            @RequestParam String targetType,
            @RequestParam String targetId,
            @RequestParam(required = false) String targetName,
            @RequestParam int rating,
            @RequestParam String comment,
            @RequestParam(required = false) List<String> photos) {

        Review review =
                reviewService.createReview(
                        userId,
                        targetType,
                        targetId,
                        targetName,
                        rating,
                        comment,
                        photos
                );

        return ResponseEntity.ok(review);
    }


    // ==========================================
    // GET REVIEWS
    // ==========================================

    @GetMapping
    public ResponseEntity<List<Review>> getReviews(
            @RequestParam String targetType,
            @RequestParam String targetId,
            @RequestParam(required = false) String sort,
            @RequestParam(required = false) Integer rating) {

        List<Review> reviews =
                reviewService.getReviews(
                        targetType,
                        targetId,
                        sort,
                        rating
                );

        return ResponseEntity.ok(reviews);
    }


    // ==========================================
    // ADD REPLY
    // ==========================================

    @PostMapping("/{reviewId}/reply")
    public ResponseEntity<Review> addReply(
            @PathVariable String reviewId,
            @RequestParam String userId,
            @RequestParam String comment) {

        Review review =
                reviewService.addReply(
                        reviewId,
                        userId,
                        comment
                );

        return ResponseEntity.ok(review);
    }


    // ==========================================
    // MARK REVIEW HELPFUL
    // ==========================================

    @PutMapping("/{reviewId}/helpful")
    public ResponseEntity<Review> markHelpful(
            @PathVariable String reviewId) {

        Review review =
                reviewService.markHelpful(
                        reviewId
                );

        return ResponseEntity.ok(review);
    }


    // ==========================================
    // FLAG REVIEW
    // ==========================================

    @PutMapping("/{reviewId}/flag")
    public ResponseEntity<Review> flagReview(
            @PathVariable String reviewId,
            @RequestParam(required = false) String reason) {

        Review review =
                reviewService.flagReview(
                        reviewId,
                        reason
                );

        return ResponseEntity.ok(review);
    }


    // ==========================================
    // GET FLAGGED REVIEWS
    // ==========================================

    @GetMapping("/flagged")
    public ResponseEntity<List<Review>> getFlaggedReviews() {

        return ResponseEntity.ok(
                reviewService.getFlaggedReviews()
        );
    }


    // ==========================================
    // MODERATE REVIEW
    // ==========================================

    @PutMapping("/{reviewId}/moderate")
    public ResponseEntity<Review> moderateReview(
            @PathVariable String reviewId,
            @RequestParam String status) {

        Review review =
                reviewService.moderateReview(
                        reviewId,
                        status
                );

        return ResponseEntity.ok(review);
    }
}