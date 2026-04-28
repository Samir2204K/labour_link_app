package com.labourlink.backend.service;

import com.labourlink.backend.dto.BookingRequest;
import com.labourlink.backend.entity.Booking;
import com.labourlink.backend.entity.User;
import com.labourlink.backend.repository.BookingRepository;
import com.labourlink.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;

    public Booking createBooking(BookingRequest request) {
        String currentEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User customer = userRepository.findByEmail(currentEmail)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        User worker = userRepository.findById(request.getWorkerId())
                .orElseThrow(() -> new RuntimeException("Worker not found"));

        Booking booking = Booking.builder()
                .customer(customer)
                .worker(worker)
                .category(request.getCategory())
                .status("PENDING")
                .bookingDate(LocalDateTime.now())
                .scheduledDate(request.getDate())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .build();

        return bookingRepository.save(booking);
    }

    public List<Booking> getMyBookings() {
        String currentEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(currentEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (user.getRole().name().equals("CUSTOMER")) {
            return bookingRepository.findByCustomer(user);
        } else {
            return bookingRepository.findByWorker(user);
        }
    }

    public List<Booking> getBookingsByCustomer(Long customerId) {
        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        return bookingRepository.findByCustomer(customer);
    }

    public List<Booking> getBookingsByWorker(Long workerId) {
        User worker = userRepository.findById(workerId)
                .orElseThrow(() -> new RuntimeException("Worker not found"));
        return bookingRepository.findByWorker(worker);
    }

    public Booking updateBookingStatus(Long id, String status) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        // PENDING, CONFIRMED, COMPLETED, CANCELLED
        booking.setStatus(status.toUpperCase());
        return bookingRepository.save(booking);
    }
}
