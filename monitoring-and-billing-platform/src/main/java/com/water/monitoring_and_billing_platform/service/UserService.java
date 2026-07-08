package com.water.monitoring_and_billing_platform.service;

import com.water.monitoring_and_billing_platform.dto.AuthResponse;
import com.water.monitoring_and_billing_platform.dto.LoginRequest;
import com.water.monitoring_and_billing_platform.dto.RegisterRequest;
import com.water.monitoring_and_billing_platform.dto.UserMeResponse;

public interface UserService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    UserMeResponse getCurrentUser(String email);

}