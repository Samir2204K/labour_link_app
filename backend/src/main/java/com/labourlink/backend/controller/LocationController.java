package com.labourlink.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/location")
public class LocationController {

    @PostMapping
    public ResponseEntity<Map<String, String>> receiveUserLocation(@RequestBody Map<String, Double> location) {
        Double lat = location.get("lat");
        Double lng = location.get("lng");
        
        // In a real app, you might save this to the user's session or database
        System.out.println("Received user location: Lat " + lat + ", Lng " + lng);
        
        Map<String, String> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "User location received");
        return ResponseEntity.ok(response);
    }
}
