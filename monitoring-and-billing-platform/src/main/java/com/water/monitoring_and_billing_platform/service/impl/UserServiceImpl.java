package com.water.monitoring_and_billing_platform.service.impl;

import com.water.monitoring_and_billing_platform.dto.AuthResponse;
import com.water.monitoring_and_billing_platform.dto.LoginRequest;
import com.water.monitoring_and_billing_platform.dto.RegisterRequest;
import com.water.monitoring_and_billing_platform.dto.UserMeResponse;
import com.water.monitoring_and_billing_platform.entity.User;
import com.water.monitoring_and_billing_platform.enums.ApprovalStatus;
import com.water.monitoring_and_billing_platform.enums.Role;
import com.water.monitoring_and_billing_platform.exception.EmailAlreadyExistsException;
import com.water.monitoring_and_billing_platform.exception.InvalidPasswordException;
import com.water.monitoring_and_billing_platform.exception.UserNotFoundException;
import com.water.monitoring_and_billing_platform.repository.UserRepository;
import com.water.monitoring_and_billing_platform.security.JwtService;
import com.water.monitoring_and_billing_platform.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Override
    public AuthResponse register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException();
        }

        if (request.getRequestedRole() == Role.MAIN_ADMIN) {
            throw new IllegalArgumentException(
                    "Main Admin accounts cannot be created through registration."
            );
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRequestedRole())
                .active(true)
                .approvalStatus(ApprovalStatus.PENDING)
                .build();

        User savedUser = userRepository.save(user);

        return new AuthResponse(
                "Registration Successful",
                null,
                savedUser.getId(),
                savedUser.getFullName(),
                savedUser.getEmail(),
                savedUser.getRole().name(),
                savedUser.getApprovalStatus().name()
        );
    }

    @Override
    public AuthResponse login(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(UserNotFoundException::new);

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new InvalidPasswordException();
        }

        if (!user.isActive()) {
            throw new IllegalStateException(
                    "Your account has been deactivated. Please contact administrator."
            );
        }

        if (user.getApprovalStatus() != ApprovalStatus.APPROVED) {
            throw new IllegalStateException(
                    "Your registration is awaiting administrator approval."
            );
        }

        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);

        String token = jwtService.generateToken(user);

        return new AuthResponse(
                "Login Successful",
                token,
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole().name(),
                user.getApprovalStatus().name()
        );
    }

    @Override
    public UserMeResponse getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(UserNotFoundException::new);

        return UserMeResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .approvalStatus(user.getApprovalStatus().name())
                .active(user.isActive())
                .lastLogin(user.getLastLogin())
                .build();
    }
}