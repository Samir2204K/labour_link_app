package com.labourlink.backend.controller;

import com.labourlink.backend.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/test")
@RequiredArgsConstructor
public class TestController {

    private final EmailService emailService;

    @PostMapping("/send-email")
    public ResponseEntity<?> sendTestEmail(@RequestParam String to) {
        try {
            emailService.sendSimpleEmail(to, "Labour Link Test Email", "This is a test email from Labour Link application.");
            return ResponseEntity.ok(Map.of("message", "Test email sent successfully to " + to));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
}
