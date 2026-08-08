package com.makemytrip.makemytrip.controllers;
import com.makemytrip.makemytrip.models.Flight;
import com.makemytrip.makemytrip.models.Hotel;
import com.makemytrip.makemytrip.models.PriceHistory;
import com.makemytrip.makemytrip.repositories.FlightRepository;
import com.makemytrip.makemytrip.repositories.HotelRepository;
import com.makemytrip.makemytrip.repositories.PriceHistoryRepository;
import org.springframework. beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.makemytrip.makemytrip.services.MockFlightStatusService;
import java.util.Optional;
import java.util.List;
import com.makemytrip.makemytrip.services.DynamicPricingService;
import com.makemytrip.makemytrip.models.PriceFreeze;
import com.makemytrip.makemytrip.services.PriceFreezeService;


@RestController
@CrossOrigin(origins = "*")
public class RootController {
    @Autowired
    private HotelRepository hotelRepository;

    @Autowired
    private FlightRepository flightRepository;
    @Autowired
    private PriceHistoryRepository priceHistoryRepository;
    @Autowired
    private DynamicPricingService dynamicPricingService;
    @Autowired
    private PriceFreezeService priceFreezeService;
    @GetMapping("/")
    public String home() {return "Its running on port 8080";}

    @GetMapping("/hotel")
    public ResponseEntity<List<Hotel>> getallhotels(){
        List<Hotel> hotels=hotelRepository.findAll();
        return ResponseEntity.ok(hotels);
    }
    @GetMapping("/flight")
    public ResponseEntity<List<Flight>> getallflights(){
        List<Flight> flights=flightRepository.findAll();
        return ResponseEntity.ok(flights);
    }
    @GetMapping("/flight/{id}/status")
    public ResponseEntity<Flight> getFlightStatus(@PathVariable String id) {

        Optional<Flight> flight = flightRepository.findById(id);

        if (flight.isPresent()) {
            return ResponseEntity.ok(flight.get());
        }

        return ResponseEntity.notFound().build();
    }
    @PutMapping("/flight/{id}/track")
    public ResponseEntity<Flight> trackFlight(@PathVariable String id) {

        Optional<Flight> optionalFlight = flightRepository.findById(id);

        if (optionalFlight.isPresent()) {

            Flight flight = optionalFlight.get();

            flight.setTracked(true);

            flightRepository.save(flight);

            return ResponseEntity.ok(flight);
        }

        return ResponseEntity.notFound().build();
    }
    @GetMapping("/flight/tracked")
    public ResponseEntity<List<Flight>> getTrackedFlights() {

        List<Flight> flights = flightRepository.findAll();

        List<Flight> trackedFlights = new java.util.ArrayList<>();

        for (Flight flight : flights) {

            if (flight.isTracked()) {
                trackedFlights.add(flight);
            }
        }

        return ResponseEntity.ok(trackedFlights);
    }
    @Autowired
    private MockFlightStatusService mockFlightStatusService;
    @GetMapping("/flight/{id}/live-status")
    public ResponseEntity<Flight> getLiveFlightStatus(@PathVariable String id) {

        Optional<Flight> optionalFlight = flightRepository.findById(id);

        if (optionalFlight.isPresent()) {

            Flight flight = optionalFlight.get();

            flight = mockFlightStatusService.generateMockStatus(flight);

            flightRepository.save(flight);

            return ResponseEntity.ok(flight);
        }

        return ResponseEntity.notFound().build();
    }
    @GetMapping("/flight/{id}/dynamic-price")
    public ResponseEntity<Flight> getDynamicPrice(@PathVariable String id) {

        Optional<Flight> optionalFlight = flightRepository.findById(id);

        if (optionalFlight.isPresent()) {

            Flight flight = optionalFlight.get();

            Flight updatedFlight =
                    dynamicPricingService.calculateDynamicPrice(flight);

            return ResponseEntity.ok(updatedFlight);
        }

        return ResponseEntity.notFound().build();
    }

    @GetMapping("/flight/{id}/price-history")
    public ResponseEntity<List<PriceHistory>> getPriceHistory(
            @PathVariable String id) {

        List<PriceHistory> history =
                priceHistoryRepository.findByFlightId(id);

        return ResponseEntity.ok(history);
    }

    @PostMapping("/flight/{id}/price-freeze")
    public ResponseEntity<?> freezeFlightPrice(
            @PathVariable String id,
            @RequestParam(defaultValue = "15") int minutes) {

        Optional<Flight> optionalFlight = flightRepository.findById(id);

        if (optionalFlight.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Flight flight = optionalFlight.get();

        PriceFreeze priceFreeze =
                priceFreezeService.freezePrice(flight, minutes);

        return ResponseEntity.ok(priceFreeze);
    }
}