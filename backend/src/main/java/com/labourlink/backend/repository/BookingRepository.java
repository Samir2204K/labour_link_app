package com.labourlink.backend.repository;

import com.labourlink.backend.entity.Booking;
import com.labourlink.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByCustomer(User customer);
    List<Booking> findByWorker(User worker);
}
