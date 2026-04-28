package com.labourlink.backend.controller;

import com.labourlink.backend.dto.OtpRequest;
import com.labourlink.backend.dto.OtpVerificationRequest;
import com.labourlink.backend.service.OtpService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class OtpController {

    private final OtpService otpService;

    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@RequestBody OtpRequest request) {
        otpService.sendOtp(request.getEmail());
        return ResponseEntity.ok(Map.of("message", "OTP sent successfully"));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody OtpVerificationRequest request) {
        String result = otpService.verifyOtp(request.getEmail(), request.getOtp());
        
        if ("success".equals(result)) {
            return ResponseEntity.ok(Map.of("message", "OTP verified successfully"));
        } else {
            return ResponseEntity.badRequest().body(Map.of("message", result));
        }
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<?> resendOtp(@RequestBody OtpRequest request) {
        String result = otpService.resendOtp(request.getEmail());
        
        if ("success".equals(result)) {
            return ResponseEntity.ok(Map.of("message", "OTP resent successfully"));
        } else {
            return ResponseEntity.badRequest().body(Map.of("message", result));
        }
    }
}
