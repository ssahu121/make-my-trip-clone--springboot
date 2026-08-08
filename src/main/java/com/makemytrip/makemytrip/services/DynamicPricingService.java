package com.makemytrip.makemytrip.services;

import com.makemytrip.makemytrip.models.Flight;
import com.makemytrip.makemytrip.models.PriceHistory;
import com.makemytrip.makemytrip.repositories.FlightRepository;
import com.makemytrip.makemytrip.repositories.PriceHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class DynamicPricingService {

    @Autowired
    private FlightRepository flightRepository;

    @Autowired
    private PriceHistoryRepository priceHistoryRepository;

    public Flight calculateDynamicPrice(Flight flight) {

        // Original price save karo
        if (flight.getBasePrice() <= 0) {
            flight.setBasePrice(flight.getPrice());
        }

        double basePrice = flight.getBasePrice();

        // Current/old price
        double oldPrice = flight.getPrice();

        double finalPrice = basePrice;

        // Demand calculate based on available seats
        int seats = flight.getAvailableSeats();

        if (seats <= 20) {

            flight.setDemandLevel("HIGH");
            finalPrice = basePrice * 1.20;

        } else if (seats <= 50) {

            flight.setDemandLevel("MEDIUM");
            finalPrice = basePrice * 1.10;

        } else {

            flight.setDemandLevel("LOW");
            finalPrice = basePrice;
        }

        // Season check
        LocalDateTime departure =
                LocalDateTime.parse(flight.getDepartureTime());

        int month = departure.getMonthValue();

        if (month == 5 || month == 6 || month == 12) {

            flight.setSeason("PEAK");
            finalPrice = finalPrice * 1.20;

        } else {

            flight.setSeason("NORMAL");
        }

        // New price
        flight.setPrice(
                Math.round(finalPrice * 100.0) / 100.0
        );

        flight.setPriceLastUpdated(
                LocalDateTime.now().toString()
        );

        // Save price history only when price changes
        double newPrice = flight.getPrice();

        if (oldPrice != newPrice) {

            PriceHistory history = new PriceHistory();

            history.setFlightId(flight.getId());
            history.setFlightName(flight.getFlightName());

            history.setOldPrice(oldPrice);
            history.setNewPrice(newPrice);

            history.setDemandLevel(
                    flight.getDemandLevel()
            );

            history.setSeason(
                    flight.getSeason()
            );

            history.setUpdatedAt(
                    LocalDateTime.now().toString()
            );

            priceHistoryRepository.save(history);
        }

        return flightRepository.save(flight);
    }
}