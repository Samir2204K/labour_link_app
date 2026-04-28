package com.labourlink.backend.service;

import com.labourlink.backend.dto.AuthRequest;
import com.labourlink.backend.dto.AuthResponse;
import com.labourlink.backend.dto.RegisterRequest;
import com.labourlink.backend.entity.Role;
import com.labourlink.backend.entity.User;
import com.labourlink.backend.entity.WorkerProfile;
import com.labourlink.backend.repository.UserRepository;
import com.labourlink.backend.repository.WorkerProfileRepository;
import com.labourlink.backend.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final WorkerProfileRepository workerProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final OtpService otpService;

    @Transactional
    public void registerRequest(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        // Create user but not verified
        User user = User.builder()
                .name(request.getFullname())
                .mobile(request.getMobile())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .verified(false)
                .build();

        userRepository.save(user);
        
        // If it's a worker, we might want to create profile now or later. 
        if (request.getRole() == Role.WORKER) {
            WorkerProfile profile = WorkerProfile.builder()
                    .user(user)
                    .category(request.getCategory())
                    .experience(request.getExperience())
                    .price(request.getPrice())
                    .rating(5.0)
                    .jobsCount(0)
                    .image("https://cdn-icons-png.flaticon.com/512/3135/3135715.png")
                    .build();
            workerProfileRepository.save(profile);
        }

        otpService.sendOtp(request.getEmail());
    }

    @Transactional
    public AuthResponse verifyRegistration(String email, String otpCode) {
        String result = otpService.verifyOtp(email, otpCode);
        if (!"success".equals(result)) {
            throw new RuntimeException(result);
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setVerified(true);
        userRepository.save(user);

        var userDetails = new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
        );
        var jwtToken = jwtService.generateToken(userDetails);

        return buildAuthResponse(user, jwtToken);
    }

    public AuthResponse login(AuthRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.isVerified()) {
            throw new RuntimeException("Account not verified. Please verify your email.");
        }

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        var userDetails = new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
        );
        var jwtToken = jwtService.generateToken(userDetails);

        return buildAuthResponse(user, jwtToken);
    }

    public void resendOtp(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (user.isVerified()) {
            throw new RuntimeException("User is already verified");
        }
        
        String result = otpService.resendOtp(email);
        if (!"success".equals(result)) {
            throw new RuntimeException(result);
        }
    }

    private AuthResponse buildAuthResponse(User user, String token) {
        return AuthResponse.builder()
                .token(token)
                .user(AuthResponse.UserResponse.builder()
                        .id(user.getId())
                        .name(user.getName())
                        .mobile(user.getMobile())
                        .email(user.getEmail())
                        .role(user.getRole())
                        .build())
                .build();
    }
}
