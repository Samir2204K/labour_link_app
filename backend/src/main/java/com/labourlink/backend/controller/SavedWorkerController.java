package com.labourlink.backend.controller;

import com.labourlink.backend.dto.WorkerDTO;
import com.labourlink.backend.service.SavedWorkerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/saved-workers")
@RequiredArgsConstructor
public class SavedWorkerController {

    private final SavedWorkerService savedWorkerService;

    @GetMapping
    public ResponseEntity<List<WorkerDTO>> getSavedWorkers() {
        return ResponseEntity.ok(savedWorkerService.getSavedWorkers());
    }

    @GetMapping("/ids")
    public ResponseEntity<List<Long>> getSavedWorkerIds() {
        return ResponseEntity.ok(savedWorkerService.getSavedWorkerIds());
    }

    @PostMapping("/{workerId}")
    public ResponseEntity<WorkerDTO> saveWorker(@PathVariable Long workerId) {
        return ResponseEntity.ok(savedWorkerService.saveWorker(workerId));
    }

    @DeleteMapping("/{workerId}")
    public ResponseEntity<Map<String, String>> removeSavedWorker(@PathVariable Long workerId) {
        savedWorkerService.removeWorker(workerId);
        return ResponseEntity.ok(Map.of("message", "Worker removed from saved list"));
    }
}
