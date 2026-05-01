package com.labourlink.backend.dto;

import com.labourlink.backend.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProfileResponse {
    private AuthResponse.UserResponse user;
    private WorkerProfileResponse workerProfile;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WorkerProfileResponse {
        private String category;
        private Integer experience;
        private Double price;
        private String image;
        private Double rating;
        private Integer jobsCount;
        private Double latitude;
        private Double longitude;
        private Boolean available;
    }
}
