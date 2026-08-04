package com.makemytrip.makemytrip.services;

import com.makemytrip.makemytrip.models.Flight;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Random;

@Service
public class MockFlightStatusService {

    private final Random random = new Random();

    private final String[] statusList = {
            "ON_TIME",
            "BOARDING",
            "DELAYED",
            "DEPARTED",
            "LANDED"
    };

    private final String[] delayReasons = {
            "Heavy Rain",
            "Technical Issue",
            "Air Traffic",
            "Weather",
            "Crew Delay"
    };

    public Flight generateMockStatus(Flight flight) {

        // Random Status
        String status = statusList[random.nextInt(statusList.length)];
        flight.setStatus(status);

        if ("DELAYED".equals(status)) {

            int delay = (random.nextInt(6) + 1) * 10; //10-60 mins

            flight.setDelayMinutes(delay);

            flight.setDelayReason(
                    delayReasons[random.nextInt(delayReasons.length)]
            );

            LocalDateTime departure =
                    LocalDateTime.parse(flight.getDepartureTime());

            LocalDateTime arrival =
                    LocalDateTime.parse(flight.getArrivalTime());

            flight.setEstimatedDepartureTime(
                    departure.plusMinutes(delay).toString()
            );

            flight.setEstimatedArrivalTime(
                    arrival.plusMinutes(delay).toString()
            );

        } else {

            flight.setDelayMinutes(0);
            flight.setDelayReason("No Delay");

            flight.setEstimatedDepartureTime(
                    flight.getDepartureTime()
            );

            flight.setEstimatedArrivalTime(
                    flight.getArrivalTime()
            );
        }

        flight.setLastUpdated(LocalDateTime.now().toString());

        return flight;
    }

}