package com.labourlink.backend.service;

import com.labourlink.backend.dto.WorkerDTO;
import com.labourlink.backend.entity.Role;
import com.labourlink.backend.entity.User;
import com.labourlink.backend.entity.WorkerProfile;
import com.labourlink.backend.repository.BookingRepository;
import com.labourlink.backend.repository.UserRepository;
import com.labourlink.backend.repository.WorkerProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final WorkerProfileRepository workerProfileRepository;
    private final BookingRepository bookingRepository;

    public Map<String, Object> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalWorkers", workerProfileRepository.count());
        stats.put("totalBookings", bookingRepository.count());
        return stats;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public List<WorkerDTO> getAllWorkers() {
        return workerProfileRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    @Transactional
    public void deleteWorker(Long id) {
        workerProfileRepository.deleteById(id);
        userRepository.deleteById(id);
    }

    private WorkerDTO convertToDTO(WorkerProfile profile) {
        return WorkerDTO.builder()
                .id(profile.getUserId())
                .name(profile.getUser().getName())
                .mobile(profile.getUser().getMobile())
                .category(profile.getCategory())
                .exp(profile.getExperience())
                .price(profile.getPrice())
                .image(profile.getImage())
                .rating(profile.getRating())
                .jobs(profile.getJobsCount())
                .build();
    }
}
