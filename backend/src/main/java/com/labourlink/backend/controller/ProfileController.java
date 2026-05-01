package com.labourlink.backend.controller;

import com.labourlink.backend.dto.ProfileResponse;
import com.labourlink.backend.dto.ProfileUpdateRequest;
import com.labourlink.backend.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/me")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping
    public ResponseEntity<ProfileResponse> getMyProfile() {
        return ResponseEntity.ok(profileService.getMyProfile());
    }

    @PutMapping
    public ResponseEntity<ProfileResponse> updateMyProfile(@RequestBody ProfileUpdateRequest request) {
        return ResponseEntity.ok(profileService.updateMyProfile(request));
    }
}
