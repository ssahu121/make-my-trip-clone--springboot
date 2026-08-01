package com.makemytrip.makemytrip.controllers;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.makemytrip.makemytrip.models.Flight;
import com.makemytrip.makemytrip.models.Hotel;
import com.makemytrip.makemytrip.models.Users;
import com.makemytrip.makemytrip.repositories.UserRepository;
import com.makemytrip.makemytrip.repositories.FlightRepository;
import com.makemytrip.makemytrip.repositories.HotelRepository;
import java.util.List;
import java.util.Optional;
@RestController
@RequestMapping("/admin")
@CrossOrigin(origins = "*")
public class AdminController {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private  HotelRepository hotelRepository;

    @Autowired
    private FlightRepository flightRepository;

     @GetMapping("/users")
    public ResponseEntity<List<Users>> getallusers(){
           List<Users> users=userRepository.findAll();
    return ResponseEntity.ok(users);
    }
    @PostMapping("/flight")
    public Flight addflight(@RequestBody Flight flight) {
          return flightRepository.save(flight);
    }
     @PostMapping("/hotel")
    public Hotel addhotel(@RequestBody Hotel hotel) {
          return hotelRepository.save(hotel);
    }
    @PutMapping("/flight/{id}")
    public ResponseEntity<Flight> editflight(@PathVariable String id, @RequestBody Flight UpdatedFlight) {
        Optional<Flight> flightOptional = flightRepository.findById(id);
        if (flightOptional.isPresent()) {
            Flight flight = flightOptional.get();
            flight.setFlightName(UpdatedFlight.getFlightName());
            flight.setFrom(UpdatedFlight.getFrom());
             flight.setTo(UpdatedFlight.getTo());
            flight.setDepartureTime(UpdatedFlight.getDepartureTime());
            flight.setArrivalTime(UpdatedFlight.getArrivalTime());
            flight.setPrice(UpdatedFlight.getPrice());
             flight.setAvailableSeats(UpdatedFlight.getAvailableSeats());
           flightRepository.save(flight);
            return ResponseEntity.ok(flight);
        }
            return ResponseEntity.notFound().build();
        }
    @PutMapping("/hotel/{id}")
    public ResponseEntity<Hotel> edithotel(@PathVariable String id, @RequestBody Hotel UpdatedHotel) {
        Optional<Hotel> hotelOptional = hotelRepository.findById(id);
        if (hotelOptional.isPresent()) {
            Hotel hotel = hotelOptional.get();
            hotel.setHotelName(UpdatedHotel.getHotelName());
            hotel.setLocation(UpdatedHotel.getLocation());
            hotel.setAvailableRooms(UpdatedHotel.getAvailableRooms());
            hotel.setPricePerNight(UpdatedHotel.getPricePerNight());
            hotel.setAmenities(UpdatedHotel.getAmenities());
            hotelRepository.save(hotel);
            return ResponseEntity.ok(hotel);
        }
            return ResponseEntity.notFound().build();
        }

}



