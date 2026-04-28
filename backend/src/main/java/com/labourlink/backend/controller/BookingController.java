package com.labourlink.backend.controller;

import com.labourlink.backend.dto.BookingRequest;
import com.labourlink.backend.entity.Booking;
import com.labourlink.backend.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    public ResponseEntity<Booking> createBooking(@RequestBody BookingRequest request) {
        return ResponseEntity.ok(bookingService.createBooking(request));
    }

    @GetMapping
    public ResponseEntity<List<Booking>> getMyBookings() {
        return ResponseEntity.ok(bookingService.getMyBookings());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Booking>> getBookingsByCustomer(@PathVariable Long userId) {
        return ResponseEntity.ok(bookingService.getBookingsByCustomer(userId));
    }

    @GetMapping("/worker/{workerId}")
    public ResponseEntity<List<Booking>> getBookingsByWorker(@PathVariable Long workerId) {
        return ResponseEntity.ok(bookingService.getBookingsByWorker(workerId));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Booking> updateBookingStatus(@PathVariable Long id, @RequestBody Map<String, String> statusRequest) {
        String status = statusRequest.get("status");
        return ResponseEntity.ok(bookingService.updateBookingStatus(id, status));
    }
}
