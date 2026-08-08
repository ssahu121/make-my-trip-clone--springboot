package com.makemytrip.makemytrip.repositories;

import com.makemytrip.makemytrip.models.PriceFreeze;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface PriceFreezeRepository
        extends MongoRepository<PriceFreeze, String> {

    Optional<PriceFreeze> findByFlightIdAndActiveTrue(String flightId);
}