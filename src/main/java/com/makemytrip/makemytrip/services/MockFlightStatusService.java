
package com.makemytrip.makemytrip.services;

import com.makemytrip.makemytrip.models.Flight;
import com.makemytrip.makemytrip.repositories.FlightRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.Duration;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Locale;
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

    // Generate Mock Flight Status
    public Flight generateMockStatus(Flight flight) {

        if (flight == null) {
            return null;
        }

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime departure = parseDateTime(flight.getDepartureTime());
        LocalDateTime arrival = parseDateTime(flight.getArrivalTime());

        // Determine status from flight date and time when parseable.
        if (departure != null && arrival != null
                && !arrival.isBefore(departure)) {

            if (!now.isBefore(arrival)) {
                flight.setStatus("LANDED");
                flight.setDelayMinutes(0);
                flight.setDelayReason("No Delay");
                flight.setEstimatedDepartureTime(departure.toString());
                flight.setEstimatedArrivalTime(arrival.toString());
                flight.setNotification(
                        "Flight " + flight.getFlightName() + " has LANDED"
                );
                flight.setLastUpdated(now.toString());
                return flight;
            }

            if (now.isBefore(departure)) {
                long minutesToDeparture =
                        Duration.between(now, departure).toMinutes();

                // Preserve an existing delay status instead of randomly
                // changing it on every scheduled update.
                if (!"DELAYED".equals(flight.getStatus())) {

                    if (minutesToDeparture <= 30) {
                        flight.setStatus("BOARDING");
                        flight.setNotification(
                                "Flight " + flight.getFlightName()
                                        + " is now BOARDING"
                        );
                    } else {
                        flight.setStatus("ON_TIME");
                        flight.setNotification(
                                "Flight " + flight.getFlightName()
                                        + " is ON TIME"
                        );
                    }

                    flight.setDelayMinutes(0);
                    flight.setDelayReason("No Delay");
                    flight.setEstimatedDepartureTime(departure.toString());
                    flight.setEstimatedArrivalTime(arrival.toString());
                    flight.setLastUpdated(now.toString());
                    return flight;
                }
            } else {
                flight.setStatus("DEPARTED");
                flight.setDelayMinutes(0);
                flight.setDelayReason("No Delay");
                flight.setEstimatedDepartureTime(departure.toString());
                flight.setEstimatedArrivalTime(arrival.toString());
                flight.setNotification(
                        "Flight " + flight.getFlightName() + " has DEPARTED"
                );
                flight.setLastUpdated(now.toString());
                return flight;
            }
        }

        // Original random mock status feature retained for cases where
        // flight dates cannot be parsed.
        String status = statusList[random.nextInt(statusList.length)];

        flight.setStatus(status);

        // DELAYED
        if ("DELAYED".equals(status)) {

            int delay = (random.nextInt(6) + 1) * 10;
            flight.setDelayMinutes(delay);

            String reason =
                    delayReasons[random.nextInt(delayReasons.length)];

            flight.setDelayReason(reason);

            try {
                if (departure != null) {
                    flight.setEstimatedDepartureTime(
                            departure.plusMinutes(delay).toString()
                    );
                } else {
                    flight.setEstimatedDepartureTime(
                            flight.getDepartureTime()
                    );
                }

                if (arrival != null) {
                    flight.setEstimatedArrivalTime(
                            arrival.plusMinutes(delay).toString()
                    );
                } else {
                    flight.setEstimatedArrivalTime(
                            flight.getArrivalTime()
                    );
                }

            } catch (Exception e) {
                System.out.println(
                        "Date parsing error for flight: " + flight.getId()
                );

                flight.setEstimatedDepartureTime(
                        flight.getDepartureTime()
                );
                flight.setEstimatedArrivalTime(
                        flight.getArrivalTime()
                );
            }

            flight.setNotification(
                    "Flight " + flight.getFlightName()
                            + " delayed by " + delay
                            + " minutes due to " + reason
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
                            "Flight " + flight.getFlightName()
                                    + " is now BOARDING"
                    );
                    break;

                case "DEPARTED":
                    flight.setNotification(
                            "Flight " + flight.getFlightName()
                                    + " has DEPARTED"
                    );
                    break;

                case "LANDED":
                    flight.setNotification(
                            "Flight " + flight.getFlightName()
                                    + " has LANDED"
                    );
                    break;

                default:
                    flight.setNotification(
                            "Flight " + flight.getFlightName()
                                    + " is ON TIME"
                    );
            }
        }

        flight.setLastUpdated(LocalDateTime.now().toString());

        return flight;
    }

    // SAFE DATE/TIME PARSER
    // Supports ISO date-time, common date-time formats, 24-hour time,
    // and 12-hour time such as 10:00 AM or 12:00 PM.
    private LocalDateTime parseDateTime(String value) {

        if (value == null || value.trim().isEmpty()) {
            return null;
        }

        value = value.trim();

        // Standard ISO date-time
        try {
            return LocalDateTime.parse(value);
        } catch (DateTimeParseException ignored) {
        }

        // Date and time formats
        DateTimeFormatter[] dateTimeFormats = {
                DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm"),
                DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"),
                DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"),
                DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm"),
                DateTimeFormatter.ofPattern(
                        "yyyy-MM-dd h:mm a", Locale.ENGLISH),
                DateTimeFormatter.ofPattern(
                        "yyyy-MM-dd'T'h:mm a", Locale.ENGLISH),
                DateTimeFormatter.ofPattern(
                        "dd-MM-yyyy h:mm a", Locale.ENGLISH),
                DateTimeFormatter.ofPattern(
                        "dd-MM-yyyy hh:mm a", Locale.ENGLISH)
        };

        for (DateTimeFormatter formatter : dateTimeFormats) {
            try {
                return LocalDateTime.parse(value, formatter);
            } catch (DateTimeParseException ignored) {
            }
        }

        // Time-only formats: use today's date
        DateTimeFormatter[] timeFormats = {
                DateTimeFormatter.ofPattern("HH:mm"),
                DateTimeFormatter.ofPattern("h:mm a", Locale.ENGLISH),
                DateTimeFormatter.ofPattern("hh:mm a", Locale.ENGLISH)
        };

        for (DateTimeFormatter formatter : timeFormats) {
            try {
                LocalTime time = LocalTime.parse(value, formatter);
                return LocalDate.now().atTime(time);
            } catch (DateTimeParseException ignored) {
            }
        }

        System.out.println("Invalid date/time format: " + value);
        return null;
    }

    // AUTO UPDATE EVERY 30 SECONDS
    @Scheduled(fixedRate = 30000)
    public void updateAllFlightStatus() {

        try {
            List<Flight> flights = flightRepository.findAll();

            for (Flight flight : flights) {
                try {
                    Flight updatedFlight = generateMockStatus(flight);

                    if (updatedFlight != null) {
                        flightRepository.save(updatedFlight);
                    }

                } catch (Exception e) {
                    System.out.println(
                            "Error updating flight: " + flight.getId()
                    );
                    e.printStackTrace();
                }
            }

            System.out.println(
                    "Flight status updated for all flights at: "
                            + LocalDateTime.now()
            );

        } catch (Exception e) {
            System.out.println("Error while updating flight statuses");
            e.printStackTrace();
        }
    }
}
