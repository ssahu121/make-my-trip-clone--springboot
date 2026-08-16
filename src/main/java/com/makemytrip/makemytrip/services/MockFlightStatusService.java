package com.makemytrip.makemytrip.services;

import com.makemytrip.makemytrip.models.Flight;
import com.makemytrip.makemytrip.repositories.FlightRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;
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

    // =========================================================
    // Generate Mock Flight Status
    // =========================================================
    public Flight generateMockStatus(Flight flight) {

        if (flight == null) {
            return null;
        }

        String status =
                statusList[random.nextInt(statusList.length)];

        flight.setStatus(status);

        // =====================================================
        // DELAYED
        // =====================================================
        if ("DELAYED".equals(status)) {

            int delay =
                    (random.nextInt(6) + 1) * 10;

            flight.setDelayMinutes(delay);

            String reason =
                    delayReasons[
                            random.nextInt(delayReasons.length)
                            ];

            flight.setDelayReason(reason);

            try {

                LocalDateTime departure =
                        parseDateTime(
                                flight.getDepartureTime()
                        );

                LocalDateTime arrival =
                        parseDateTime(
                                flight.getArrivalTime()
                        );

                if (departure != null) {

                    flight.setEstimatedDepartureTime(
                            departure
                                    .plusMinutes(delay)
                                    .toString()
                    );
                }

                if (arrival != null) {

                    flight.setEstimatedArrivalTime(
                            arrival
                                    .plusMinutes(delay)
                                    .toString()
                    );
                }

            } catch (Exception e) {

                System.out.println(
                        "Date parsing error for flight: "
                                + flight.getId()
                );

                System.out.println(
                        "Departure: "
                                + flight.getDepartureTime()
                );

                System.out.println(
                        "Arrival: "
                                + flight.getArrivalTime()
                );

                // Don't crash complete scheduler
                flight.setEstimatedDepartureTime(
                        flight.getDepartureTime()
                );

                flight.setEstimatedArrivalTime(
                        flight.getArrivalTime()
                );
            }

            flight.setNotification(
                    "Flight "
                            + flight.getFlightName()
                            + " delayed by "
                            + delay
                            + " minutes due to "
                            + reason
            );

        }

        // =====================================================
        // NOT DELAYED
        // =====================================================
        else {

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
                            "Flight "
                                    + flight.getFlightName()
                                    + " is now BOARDING"
                    );

                    break;

                case "DEPARTED":

                    flight.setNotification(
                            "Flight "
                                    + flight.getFlightName()
                                    + " has DEPARTED"
                    );

                    break;

                case "LANDED":

                    flight.setNotification(
                            "Flight "
                                    + flight.getFlightName()
                                    + " has LANDED"
                    );

                    break;

                default:

                    flight.setNotification(
                            "Flight "
                                    + flight.getFlightName()
                                    + " is ON TIME"
                    );
            }
        }

        flight.setLastUpdated(
                LocalDateTime.now().toString()
        );

        return flight;
    }

    // =========================================================
    // SAFE DATE PARSER
    // =========================================================
    private LocalDateTime parseDateTime(String value) {

        if (value == null || value.trim().isEmpty()) {
            return null;
        }

        value = value.trim();

        // Format:
        // 2026-08-17T10:30:00
        try {
            return LocalDateTime.parse(value);
        } catch (DateTimeParseException ignored) {
        }

        // Format:
        // 2026-08-17T10:30
        try {
            return LocalDateTime.parse(
                    value,
                    DateTimeFormatter.ofPattern(
                            "yyyy-MM-dd'T'HH:mm"
                    )
            );
        } catch (DateTimeParseException ignored) {
        }

        // Format:
        // 2026-08-17 10:30:00
        try {
            return LocalDateTime.parse(
                    value,
                    DateTimeFormatter.ofPattern(
                            "yyyy-MM-dd HH:mm:ss"
                    )
            );
        } catch (DateTimeParseException ignored) {
        }

        // Format:
        // 2026-08-17 10:30
        try {
            return LocalDateTime.parse(
                    value,
                    DateTimeFormatter.ofPattern(
                            "yyyy-MM-dd HH:mm"
                    )
            );
        } catch (DateTimeParseException ignored) {
        }

        // Format:
        // 17-08-2026 10:30
        try {
            return LocalDateTime.parse(
                    value,
                    DateTimeFormatter.ofPattern(
                            "dd-MM-yyyy HH:mm"
                    )
            );
        } catch (DateTimeParseException ignored) {
        }

        // Format:
        // 10:30
        try {
            LocalTime time =
                    LocalTime.parse(
                            value,
                            DateTimeFormatter.ofPattern(
                                    "HH:mm"
                            )
                    );

            return LocalDate.now()
                    .atTime(time);

        } catch (DateTimeParseException ignored) {
        }

        System.out.println(
                "Invalid date/time format: " + value
        );

        return null;
    }

    // =========================================================
    // AUTO UPDATE EVERY 30 SECONDS
    // =========================================================
    @Scheduled(fixedRate = 30000)
    public void updateAllFlightStatus() {

        try {

            List<Flight> flights =
                    flightRepository.findAll();

            for (Flight flight : flights) {

                try {

                    Flight updatedFlight =
                            generateMockStatus(flight);

                    if (updatedFlight != null) {

                        flightRepository.save(
                                updatedFlight
                        );
                    }

                } catch (Exception e) {

                    System.out.println(
                            "Error updating flight: "
                                    + flight.getId()
                    );

                    e.printStackTrace();

                    // Continue with next flight
                }
            }

            System.out.println(
                    "Flight status updated for all flights at: "
                            + LocalDateTime.now()
            );

        } catch (Exception e) {

            System.out.println(
                    "Error while updating flight statuses"
            );

            e.printStackTrace();
        }
    }
}