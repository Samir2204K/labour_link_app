package com.labourlink.backend.controller;

import com.labourlink.backend.dto.WorkerDTO;
import com.labourlink.backend.service.WorkerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/workers")
@RequiredArgsConstructor
public class WorkerController {

    private final WorkerService workerService;

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
        workerService.updateWorkerLocation(workerId, lat, lng);
        return ResponseEntity.ok("Location updated successfully");
    }
}
