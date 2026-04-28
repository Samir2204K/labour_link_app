package com.labourlink.backend.dto;

import com.labourlink.backend.entity.Role;
import lombok.Data;

@Data
public class RegisterRequest {
    private String fullname;
    private String mobile;
    private String email;
    private String password;
    private Role role; // CUSTOMER or WORKER
    private String otpCode;
    
    // Worker specific fields
    private String category;
    private Integer experience;
    private Double price;
}
