package com.water.monitoring_and_billing_platform.service.impl;

import com.water.monitoring_and_billing_platform.dto.ApprovalRequest;
import com.water.monitoring_and_billing_platform.entity.User;
import com.water.monitoring_and_billing_platform.enums.ApprovalStatus;
import com.water.monitoring_and_billing_platform.exception.UserNotFoundException;
import com.water.monitoring_and_billing_platform.repository.UserRepository;
import com.water.monitoring_and_billing_platform.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;

    @Override
    public void approveUser(
            Long userId,
            ApprovalRequest request
    ){

        User user = userRepository.findById(userId)
                .orElseThrow(UserNotFoundException::new);

        user.setApprovalStatus(
                request.getApprovalStatus()
        );

        userRepository.save(user);

    }

    @Override
    public List<User> getPendingUsers() {

        return userRepository.findByApprovalStatus(
                ApprovalStatus.PENDING
        );

    }

    @Override
    public List<User> getApprovedUsers() {

        return userRepository.findByApprovalStatus(
                ApprovalStatus.APPROVED
        );

    }

    @Override
    public List<User> getRejectedUsers() {

        return userRepository.findByApprovalStatus(
                ApprovalStatus.REJECTED
        );

    }

}