package com.labourlink.backend.service;

import com.labourlink.backend.dto.AuthResponse;
import com.labourlink.backend.dto.ProfileResponse;
import com.labourlink.backend.dto.ProfileUpdateRequest;
import com.labourlink.backend.entity.User;
import com.labourlink.backend.entity.WorkerProfile;
import com.labourlink.backend.repository.UserRepository;
import com.labourlink.backend.repository.WorkerProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final UserRepository userRepository;
    private final WorkerProfileRepository workerProfileRepository;
    private final PasswordEncoder passwordEncoder;

    public ProfileResponse getMyProfile() {
        User user = getCurrentUser();
        return buildResponse(user);
    }

    @Transactional
    public ProfileResponse updateMyProfile(ProfileUpdateRequest request) {
        User user = getCurrentUser();

        if (request.getName() != null && !request.getName().isBlank()) {
            user.setName(request.getName().trim());
        }

        if (request.getMobile() != null && !request.getMobile().isBlank()) {
            String mobile = request.getMobile().trim();
            userRepository.findByMobile(mobile)
                    .filter(existing -> !existing.getId().equals(user.getId()))
                    .ifPresent(existing -> {
                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mobile number already in use");
                    });
            user.setMobile(mobile);
        }

        if (request.getNewPassword() != null && !request.getNewPassword().isBlank()) {
            if (request.getCurrentPassword() == null || request.getCurrentPassword().isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Current password is required to change password");
            }
            if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Current password is incorrect");
            }
            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        }

        userRepository.save(user);

        if ("WORKER".equals(user.getRole().name())) {
            WorkerProfile profile = workerProfileRepository.findById(user.getId()).orElseGet(() ->
                    workerProfileRepository.save(WorkerProfile.builder()
                            .user(user)
                            .category("General")
                            .experience(0)
                            .price(0.0)
                            .image("https://cdn-icons-png.flaticon.com/512/3135/3135715.png")
                            .rating(5.0)
                            .jobsCount(0)
                            .available(true)
                            .build()));

            if (request.getCategory() != null && !request.getCategory().isBlank()) {
                profile.setCategory(request.getCategory().trim());
            }
            if (request.getExperience() != null) {
                profile.setExperience(request.getExperience());
            }
            if (request.getPrice() != null) {
                profile.setPrice(request.getPrice());
            }
            if (request.getAvailable() != null) {
                profile.setAvailable(request.getAvailable());
            }
            if (request.getImage() != null && !request.getImage().isBlank()) {
                profile.setImage(request.getImage().trim());
            }

            workerProfileRepository.save(profile);
        }

        return buildResponse(user);
    }

    private User getCurrentUser() {
        String currentEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(currentEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated"));
    }

    private ProfileResponse buildResponse(User user) {
        ProfileResponse.ProfileResponseBuilder builder = ProfileResponse.builder()
                .user(AuthResponse.UserResponse.builder()
                        .id(user.getId())
                        .name(user.getName())
                        .email(user.getEmail())
                        .mobile(user.getMobile())
                        .role(user.getRole())
                        .build());

        if ("WORKER".equals(user.getRole().name())) {
            workerProfileRepository.findById(user.getId()).ifPresent(profile ->
                    builder.workerProfile(ProfileResponse.WorkerProfileResponse.builder()
                            .category(profile.getCategory())
                            .experience(profile.getExperience())
                            .price(profile.getPrice())
                            .image(profile.getImage())
                            .rating(profile.getRating())
                            .jobsCount(profile.getJobsCount())
                            .latitude(profile.getLatitude())
                            .longitude(profile.getLongitude())
                            .available(profile.getAvailable())
                            .build()));
        }

        return builder.build();
    }
}
