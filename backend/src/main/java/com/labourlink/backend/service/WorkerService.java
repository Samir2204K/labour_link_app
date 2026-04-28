package com.labourlink.backend.service;

import com.labourlink.backend.dto.WorkerDTO;
import com.labourlink.backend.entity.WorkerProfile;
import com.labourlink.backend.repository.WorkerProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WorkerService {

    private final WorkerProfileRepository workerProfileRepository;

    public List<WorkerDTO> getWorkersByCategory(String category) {
        List<WorkerProfile> profiles;
        if (category == null || category.isEmpty()) {
            profiles = workerProfileRepository.findAll();
        } else {
            profiles = workerProfileRepository.findByCategoryIgnoreCase(category);
        }

        return profiles.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public WorkerDTO getWorkerById(Long id) {
        WorkerProfile profile = workerProfileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Worker not found"));
        return convertToDTO(profile);
    }

    public void updateWorkerLocation(Long workerId, Double lat, Double lng) {
        WorkerProfile profile = workerProfileRepository.findById(workerId)
                .orElseThrow(() -> new RuntimeException("Worker not found"));
        profile.setLatitude(lat);
        profile.setLongitude(lng);
        workerProfileRepository.save(profile);
    }

    public List<WorkerDTO> getNearbyWorkers(Double lat, Double lng, Double radiusKm) {
        List<WorkerProfile> allWorkers = workerProfileRepository.findAll();
        
        return allWorkers.stream()
                .filter(w -> w.getLatitude() != null && w.getLongitude() != null)
                .map(w -> {
                    double dist = calculateDistance(lat, lng, w.getLatitude(), w.getLongitude());
                    WorkerDTO dto = convertToDTO(w);
                    dto.setDistance(Math.round(dist * 100.0) / 100.0); // Round to 2 decimal places
                    return dto;
                })
                .filter(dto -> dto.getDistance() <= radiusKm)
                .sorted((w1, w2) -> Double.compare(w1.getDistance(), w2.getDistance()))
                .collect(Collectors.toList());
    }

    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        double earthRadius = 6371; // km
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return earthRadius * c;
    }

    private WorkerDTO convertToDTO(WorkerProfile profile) {
        return WorkerDTO.builder()
                .id(profile.getUserId())
                .name(profile.getUser().getName())
                .email(profile.getUser().getEmail())
                .mobile(profile.getUser().getMobile())
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
