package com.makemytrip.makemytrip.services;

import com.makemytrip.makemytrip.models.Flight;
import com.makemytrip.makemytrip.models.PriceFreeze;
import com.makemytrip.makemytrip.models.PriceHistory;
import com.makemytrip.makemytrip.repositories.FlightRepository;
import com.makemytrip.makemytrip.repositories.PriceHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class DynamicPricingService {

    @Autowired
    private FlightRepository flightRepository;

    @Autowired
    private PriceHistoryRepository priceHistoryRepository;

    @Autowired
    private PriceFreezeService priceFreezeService;

    public Flight calculateDynamicPrice(Flight flight) {

        // STEP 1: Check whether the flight price is frozen.
        Optional<PriceFreeze> activeFreeze =
                priceFreezeService.getActiveFreeze(flight.getId());

        if (activeFreeze.isPresent()) {

            PriceFreeze freeze = activeFreeze.get();

            // Keep the price unchanged during the active freeze.
            flight.setPrice(freeze.getFrozenPrice());

            return flightRepository.save(flight);
        }

        // STEP 2: Preserve the original/base price.
        if (flight.getBasePrice() <= 0) {
            flight.setBasePrice(flight.getPrice());
        }

        double basePrice = flight.getBasePrice();
        double oldPrice = flight.getPrice();
        double finalPrice = basePrice;

        // STEP 3: Demand-based pricing.
        int availableSeats = flight.getAvailableSeats();

        if (availableSeats <= 20) {
            flight.setDemandLevel("HIGH");
            finalPrice = basePrice * 1.20;
        } else if (availableSeats <= 50) {
            flight.setDemandLevel("MEDIUM");
            finalPrice = basePrice * 1.10;
        } else {
            flight.setDemandLevel("LOW");
        }

        // STEP 4: Seasonal pricing.
        LocalDateTime departure =
                LocalDateTime.parse(flight.getDepartureTime());

        int month = departure.getMonthValue();

        if (month == 5 || month == 6 || month == 12) {
            flight.setSeason("PEAK");
            finalPrice = finalPrice * 1.20;
        } else {
            flight.setSeason("NORMAL");
        }

        // STEP 5: Round and update the calculated price.
        double newPrice =
                Math.round(finalPrice * 100.0) / 100.0;

        flight.setPrice(newPrice);
        flight.setPriceLastUpdated(LocalDateTime.now().toString());

        // STEP 6: Save history when the price changes.
        if (Double.compare(oldPrice, newPrice) != 0) {

            PriceHistory history = new PriceHistory();

            history.setFlightId(flight.getId());
            history.setFlightName(flight.getFlightName());
            history.setOldPrice(oldPrice);
            history.setNewPrice(newPrice);
            history.setDemandLevel(flight.getDemandLevel());
            history.setSeason(flight.getSeason());
            history.setUpdatedAt(LocalDateTime.now().toString());

            priceHistoryRepository.save(history);
        }

        return flightRepository.save(flight);
    }
}
