package com.makemytrip.makemytrip.services;

import com.makemytrip.makemytrip.models.Flight;
import org.springframework.stereotype.Service;
import com.makemytrip.makemytrip.repositories.FlightRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import java.util.List;
import java.time.LocalDateTime;
import java.util.Random;

@Service
public class MockFlightStatusService {
    @Autowired
    private FlightRepository flightRepository;

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

            flight.setNotification(
                    "Flight " + flight.getFlightName() +
                            " delayed by " + delay +
                            " minutes due to " + flight.getDelayReason()
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
            switch (status) {

                case "BOARDING":
                    flight.setNotification(
                            "Flight " + flight.getFlightName() + " is now BOARDING"
                    );
                    break;

                case "DEPARTED":
                    flight.setNotification(
                            "Flight " + flight.getFlightName() + " has DEPARTED"
                    );
                    break;

                case "LANDED":
                    flight.setNotification(
                            "Flight " + flight.getFlightName() + " has LANDED"
                    );
                    break;

                default:
                    flight.setNotification(
                            "Flight " + flight.getFlightName() + " is ON TIME"
                    );
            }
        }

        flight.setLastUpdated(LocalDateTime.now().toString());

        return flight;
    }
    @Scheduled(fixedRate = 30000) // Every 30 seconds
    public void updateAllFlightStatus() {

        List<Flight> flights = flightRepository.findAll();

        for (Flight flight : flights) {

            flight = generateMockStatus(flight);

            flightRepository.save(flight);
        }

        System.out.println("Flight status updated for all flights at: " + LocalDateTime.now());
    }

}