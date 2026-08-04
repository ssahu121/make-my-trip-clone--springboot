package com.makemytrip.makemytrip.controllers;
import com.makemytrip.makemytrip.models.Flight;
import com.makemytrip.makemytrip.models.Hotel;
import com.makemytrip.makemytrip.repositories.FlightRepository;
import com.makemytrip.makemytrip.repositories.HotelRepository;
import org.springframework. beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PathVariable;
import com.makemytrip.makemytrip.services.MockFlightStatusService;
import java.util.Optional;
import java.util.List;


@RestController
@CrossOrigin(origins = "*")
public class RootController {
    @Autowired
    private HotelRepository hotelRepository;

    @Autowired
    private FlightRepository flightRepository;
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
}