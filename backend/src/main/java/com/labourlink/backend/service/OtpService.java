package com.labourlink.backend.service;

import com.labourlink.backend.dto.OtpData;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class OtpService {

    private final EmailService emailService;
    
    // In-memory storage: email -> OtpData
    private final Map<String, OtpData> otpStorage = new ConcurrentHashMap<>();

    private static final long OTP_EXPIRY_MS = 300000; // 5 minutes
    private static final long RESEND_COOLDOWN_MS = 30000; // 30 seconds

    public String generateOtp() {
        SecureRandom random = new SecureRandom();
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }

    public void sendOtp(String email) {
        String otp = generateOtp();
        otpStorage.put(email, new OtpData(otp, System.currentTimeMillis()));
        
        log.info("OTP generated for {}: {}", email, otp);
        
        String subject = "Your OTP for Labour Link";
        String body = "Your OTP is: " + otp + ". It is valid for 5 minutes.";
        
        emailService.sendSimpleEmail(email, subject, body);
    }

    public String verifyOtp(String email, String userOtp) {
        OtpData storedData = otpStorage.get(email);

        if (storedData == null) {
            return "Please request OTP first";
        }

        long currentTime = System.currentTimeMillis();
        if (currentTime - storedData.getTimestamp() > OTP_EXPIRY_MS) {
            otpStorage.remove(email);
            return "OTP expired, request new one";
        }

        if (storedData.getOtp().equals(userOtp)) {
            otpStorage.remove(email); // Remove after success
            log.info("OTP verified successfully for {}", email);
            return "success";
        }

        log.warn("Invalid OTP attempt for {}", email);
        return "Invalid OTP";
    }

    public String resendOtp(String email) {
        OtpData storedData = otpStorage.get(email);

        if (storedData != null) {
            long currentTime = System.currentTimeMillis();
            long timeElapsed = currentTime - storedData.getTimestamp();

            if (timeElapsed < RESEND_COOLDOWN_MS) {
                long waitTime = (RESEND_COOLDOWN_MS - timeElapsed) / 1000;
                return "Please wait " + waitTime + " seconds before resending";
            }
        }

        sendOtp(email);
        return "success";
    }
}
