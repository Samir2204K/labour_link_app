package com.labourlink.backend.service;

import com.labourlink.backend.dto.WorkerDTO;
import com.labourlink.backend.entity.SavedWorker;
import com.labourlink.backend.entity.User;
import com.labourlink.backend.entity.WorkerProfile;
import com.labourlink.backend.repository.SavedWorkerRepository;
import com.labourlink.backend.repository.UserRepository;
import com.labourlink.backend.repository.WorkerProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SavedWorkerService {

    private final SavedWorkerRepository savedWorkerRepository;
    private final UserRepository userRepository;
    private final WorkerProfileRepository workerProfileRepository;

    @Transactional(readOnly = true)
    public List<WorkerDTO> getSavedWorkers() {
        User currentUser = getCurrentUser();
        ensureCustomer(currentUser);

        return savedWorkerRepository.findByCustomerOrderBySavedAtDesc(currentUser)
                .stream()
                .map(SavedWorker::getWorker)
                .map(this::toWorkerDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<Long> getSavedWorkerIds() {
        User currentUser = getCurrentUser();
        ensureCustomer(currentUser);
        return savedWorkerRepository.findByCustomerOrderBySavedAtDesc(currentUser)
                .stream()
                .map(savedWorker -> savedWorker.getWorker().getId())
                .toList();
    }

    @Transactional
    public WorkerDTO saveWorker(Long workerId) {
        User currentUser = getCurrentUser();
        ensureCustomer(currentUser);

        User worker = userRepository.findById(workerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Worker not found"));
        if (!"WORKER".equals(worker.getRole().name())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Selected user is not a worker");
        }

        if (savedWorkerRepository.existsByCustomerAndWorker(currentUser, worker)) {
            return toWorkerDto(worker);
        }

        savedWorkerRepository.save(SavedWorker.builder()
                .customer(currentUser)
                .worker(worker)
                .build());

        return toWorkerDto(worker);
    }

    @Transactional
    public void removeWorker(Long workerId) {
        User currentUser = getCurrentUser();
        ensureCustomer(currentUser);

        User worker = userRepository.findById(workerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Worker not found"));
        savedWorkerRepository.deleteByCustomerAndWorker(currentUser, worker);
    }

    private User getCurrentUser() {
        String currentEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(currentEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated"));
    }

    private void ensureCustomer(User user) {
        if (!"CUSTOMER".equals(user.getRole().name())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only customers can save workers");
        }
    }

    private WorkerDTO toWorkerDto(User workerUser) {
        WorkerProfile profile = workerProfileRepository.findById(workerUser.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Worker profile not found"));

        return WorkerDTO.builder()
                .id(workerUser.getId())
                .name(workerUser.getName())
                .email(workerUser.getEmail())
                .mobile(workerUser.getMobile())
                .category(profile.getCategory())
                .exp(profile.getExperience())
                .price(profile.getPrice())
                .image(profile.getImage())
                .rating(profile.getRating())
                .jobs(profile.getJobsCount())
                .latitude(profile.getLatitude())
                .longitude(profile.getLongitude())
                .available(profile.getAvailable())
                .build();
    }
}
