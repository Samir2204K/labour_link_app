package com.labourlink.backend.controller;

import com.labourlink.backend.dto.WorkerDTO;
import com.labourlink.backend.entity.User;
import com.labourlink.backend.service.WorkerService;
import com.labourlink.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/workers")
@RequiredArgsConstructor
public class WorkerController {

    private final WorkerService workerService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getWorkers(@RequestParam(required = false) String category) {
        List<WorkerDTO> workers = workerService.getWorkersByCategory(category);
        Map<String, Object> response = new HashMap<>();
        response.put("content", workers);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<WorkerDTO> getWorkerById(@PathVariable Long id) {
        return ResponseEntity.ok(workerService.getWorkerById(id));
    }

    @GetMapping("/nearby")
    public ResponseEntity<List<WorkerDTO>> getNearbyWorkers(
            @RequestParam Double lat,
            @RequestParam Double lng,
            @RequestParam(defaultValue = "5.0") Double radius) {
        return ResponseEntity.ok(workerService.getNearbyWorkers(lat, lng, radius));
    }

    @PostMapping("/update-location")
    public ResponseEntity<String> updateLocation(
            @RequestParam Long workerId,
            @RequestParam Double lat,
            @RequestParam Double lng) {
        User currentUser = getCurrentUser();
        boolean isAdmin = "ADMIN".equals(currentUser.getRole().name());
        boolean isOwner = "WORKER".equals(currentUser.getRole().name()) && currentUser.getId().equals(workerId);
        if (!isAdmin && !isOwner) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only update your own location");
        }
        workerService.updateWorkerLocation(workerId, lat, lng);
        return ResponseEntity.ok("Location updated successfully");
    }

    private User getCurrentUser() {
        String currentEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(currentEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated"));
    }
}
