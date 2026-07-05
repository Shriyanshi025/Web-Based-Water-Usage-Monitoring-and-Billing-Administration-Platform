package com.water.monitoring_and_billing_platform.service.impl;

import org.springframework.security.crypto.password.PasswordEncoder;
import com.water.monitoring_and_billing_platform.dto.LoginRequest;
import com.water.monitoring_and_billing_platform.dto.AuthResponse;
import com.water.monitoring_and_billing_platform.dto.RegisterRequest;
import com.water.monitoring_and_billing_platform.entity.User;
import com.water.monitoring_and_billing_platform.enums.Role;
import com.water.monitoring_and_billing_platform.repository.UserRepository;
import com.water.monitoring_and_billing_platform.service.UserService;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public AuthResponse register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            return new AuthResponse("Email already exists.");
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)
                .active(true)
                .createdAt(LocalDateTime.now())
                .build();

        userRepository.save(user);

        return new AuthResponse("Registration Successful");
    }

    @Override
    public AuthResponse login(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElse(null);

        if (user == null) {
            return new AuthResponse("User not found");
        }

        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPassword()
        )) {
            return new AuthResponse("Invalid Password");
        }

        return new AuthResponse("Login Successful");
    }
}