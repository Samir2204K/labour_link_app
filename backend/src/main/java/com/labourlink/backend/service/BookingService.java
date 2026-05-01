package com.labourlink.backend.service;

import com.labourlink.backend.dto.BookingRequest;
import com.labourlink.backend.entity.Booking;
import com.labourlink.backend.entity.User;
import com.labourlink.backend.repository.BookingRepository;
import com.labourlink.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;

    public Booking createBooking(BookingRequest request) {
        User customer = getCurrentUser();
        if (!"CUSTOMER".equals(customer.getRole().name())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only customers can create bookings");
        }
        User worker = userRepository.findById(request.getWorkerId())
                .orElseThrow(() -> new RuntimeException("Worker not found"));
        if (!"WORKER".equals(worker.getRole().name())) {
            throw new RuntimeException("Selected worker is not available for booking");
        }

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
        User user = getCurrentUser();
        
        if (user.getRole().name().equals("CUSTOMER")) {
            return bookingRepository.findByCustomer(user);
        } else if (user.getRole().name().equals("WORKER")) {
            return bookingRepository.findByWorker(user);
        }
        return bookingRepository.findAll();
    }

    public List<Booking> getBookingsByCustomer(Long customerId) {
        User currentUser = getCurrentUser();
        ensureCanAccessBookingList(currentUser, customerId, "CUSTOMER");
        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        return bookingRepository.findByCustomer(customer);
    }

    public List<Booking> getBookingsByWorker(Long workerId) {
        User currentUser = getCurrentUser();
        ensureCanAccessBookingList(currentUser, workerId, "WORKER");
        User worker = userRepository.findById(workerId)
                .orElseThrow(() -> new RuntimeException("Worker not found"));
        return bookingRepository.findByWorker(worker);
    }

    public Booking updateBookingStatus(Long id, String status) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        User currentUser = getCurrentUser();
        String normalizedStatus = status == null ? "" : status.trim().toUpperCase();
        if (normalizedStatus.isEmpty()) {
            throw new RuntimeException("Status is required");
        }

        if (!canUpdateBooking(currentUser, booking, normalizedStatus)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not allowed to update this booking");
        }

        booking.setStatus(normalizedStatus);
        return bookingRepository.save(booking);
    }

    private User getCurrentUser() {
        String currentEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(currentEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private void ensureCanAccessBookingList(User currentUser, Long targetUserId, String expectedRole) {
        boolean isAdmin = "ADMIN".equals(currentUser.getRole().name());
        boolean isOwner = currentUser.getId().equals(targetUserId) && expectedRole.equals(currentUser.getRole().name());
        if (!isAdmin && !isOwner) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not allowed to view these bookings");
        }
    }

    private boolean canUpdateBooking(User currentUser, Booking booking, String normalizedStatus) {
        if ("ADMIN".equals(currentUser.getRole().name())) {
            return true;
        }

        boolean isCustomer = currentUser.getId().equals(booking.getCustomer().getId());
        boolean isWorker = currentUser.getId().equals(booking.getWorker().getId());

        if (isCustomer) {
            return "CANCELLED".equals(normalizedStatus);
        }

        if (isWorker) {
            return "CONFIRMED".equals(normalizedStatus)
                    || "ACCEPTED".equals(normalizedStatus)
                    || "COMPLETED".equals(normalizedStatus)
                    || "CANCELLED".equals(normalizedStatus);
        }

        return false;
    }
}
