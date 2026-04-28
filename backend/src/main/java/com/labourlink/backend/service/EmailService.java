package com.labourlink.backend.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendSimpleEmail(String to, String subject, String text) {
        log.info("Sending simple email to: {}", to);
        sendEmail(to, subject, text, false);
    }

    public void sendOtpEmail(String to, String otp) {
        log.info("Preparing OTP email for: {}", to);
        String htmlContent = "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;'>" +
                "<h2 style='color: #2c3e50; text-align: center;'>Labour Link Verification</h2>" +
                "<p>Hello,</p>" +
                "<p>Your 6-digit verification code is:</p>" +
                "<div style='background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #3498db; border-radius: 5px; margin: 20px 0;'>" +
                otp + "</div>" +
                "<p>This code will expire in <b>5 minutes</b>.</p>" +
                "<p>If you did not request this code, please ignore this email.</p>" +
                "<hr style='border: 0; border-top: 1px solid #eee; margin: 20px 0;'>" +
                "<p style='font-size: 12px; color: #7f8c8d; text-align: center;'>&copy; 2026 Labour Link. All rights reserved.</p>" +
                "</div>";
        
        sendEmail(to, "Your Labour Link Verification Code", htmlContent, true);
    }

    private void sendEmail(String to, String subject, String content, boolean isHtml) {
        try {
            log.info("Attempting to send email from {} to {}...", fromEmail, to);
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(content, isHtml);
            
            mailSender.send(message);
            log.info("Email successfully sent to {}", to);
        } catch (MessagingException e) {
            log.error("SMTP Error: Failed to send email to {}. Check your username/password. Error: {}", to, e.getMessage());
            throw new RuntimeException("Email sending failed. Please check backend logs for SMTP details.");
        } catch (Exception e) {
            log.error("Unexpected error: {}", e.getMessage());
            throw new RuntimeException("Email delivery failed: " + e.getMessage());
        }
    }
}
