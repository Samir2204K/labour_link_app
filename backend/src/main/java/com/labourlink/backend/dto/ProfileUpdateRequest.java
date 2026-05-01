package com.labourlink.backend.dto;

import lombok.Data;

@Data
public class ProfileUpdateRequest {
    private String name;
    private String mobile;
    private String currentPassword;
    private String newPassword;

    private String category;
    private Integer experience;
    private Double price;
    private Boolean available;
    private String image;
}
