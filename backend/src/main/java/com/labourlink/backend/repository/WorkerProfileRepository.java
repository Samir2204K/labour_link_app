package com.labourlink.backend.repository;

import com.labourlink.backend.entity.WorkerProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface WorkerProfileRepository extends JpaRepository<WorkerProfile, Long> {
    List<WorkerProfile> findByCategoryIgnoreCase(String category);
}
