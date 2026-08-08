package com.makemytrip.makemytrip.services;

import com.makemytrip.makemytrip.models.Flight;
import com.makemytrip.makemytrip.models.PriceFreeze;
import com.makemytrip.makemytrip.repositories.PriceFreezeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class PriceFreezeService {

    @Autowired
    private PriceFreezeRepository priceFreezeRepository;

    public PriceFreeze freezePrice(Flight flight, int minutes) {

        // Check if already active
        Optional<PriceFreeze> existing =
                priceFreezeRepository.findByFlightIdAndActiveTrue(flight.getId());

        if (existing.isPresent()) {
            return existing.get();
        }

        LocalDateTime startTime = LocalDateTime.now();
        LocalDateTime expiryTime = startTime.plusMinutes(minutes);

        PriceFreeze priceFreeze = new PriceFreeze();

        priceFreeze.setFlightId(flight.getId());
        priceFreeze.setFlightName(flight.getFlightName());
        priceFreeze.setFrozenPrice(flight.getPrice());
        priceFreeze.setFreezeStartTime(startTime.toString());
        priceFreeze.setFreezeExpiryTime(expiryTime.toString());
        priceFreeze.setActive(true);

        return priceFreezeRepository.save(priceFreeze);
    }

    public Optional<PriceFreeze> getActiveFreeze(String flightId) {

        Optional<PriceFreeze> freeze =
                priceFreezeRepository.findByFlightIdAndActiveTrue(flightId);

        if (freeze.isPresent()) {

            PriceFreeze priceFreeze = freeze.get();

            LocalDateTime expiry =
                    LocalDateTime.parse(priceFreeze.getFreezeExpiryTime());

            if (LocalDateTime.now().isAfter(expiry)) {

                priceFreeze.setActive(false);
                priceFreezeRepository.save(priceFreeze);

                return Optional.empty();
            }
        }

        return freeze;
    }
}