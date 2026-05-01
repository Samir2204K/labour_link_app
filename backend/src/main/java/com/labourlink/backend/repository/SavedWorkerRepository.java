package com.labourlink.backend.repository;

import com.labourlink.backend.entity.SavedWorker;
import com.labourlink.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SavedWorkerRepository extends JpaRepository<SavedWorker, Long> {
    List<SavedWorker> findByCustomerOrderBySavedAtDesc(User customer);
    Optional<SavedWorker> findByCustomerAndWorker(User customer, User worker);
    boolean existsByCustomerAndWorker(User customer, User worker);
    void deleteByCustomerAndWorker(User customer, User worker);
}
