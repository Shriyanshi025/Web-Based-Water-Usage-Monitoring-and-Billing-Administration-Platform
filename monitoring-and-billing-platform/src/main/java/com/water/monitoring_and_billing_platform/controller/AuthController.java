package com.water.monitoring_and_billing_platform.controller;

import com.water.monitoring_and_billing_platform.dto.LoginRequest;
import com.water.monitoring_and_billing_platform.dto.RegisterRequest;
import com.water.monitoring_and_billing_platform.service.UserService;
import com.water.monitoring_and_billing_platform.dto.AuthResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final UserService userService;

    @PostMapping("/register")
    public AuthResponse register(@Valid @RequestBody RegisterRequest request){

        return userService.register(request);

    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request){

        return userService.login(request);

    }

}