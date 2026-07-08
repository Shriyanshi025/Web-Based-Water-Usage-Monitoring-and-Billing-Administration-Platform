package com.water.monitoring_and_billing_platform.service.impl;

import com.water.monitoring_and_billing_platform.dto.CommunityAdminRequest;
import com.water.monitoring_and_billing_platform.dto.CommunityAdminResponse;
import com.water.monitoring_and_billing_platform.service.CommunityAdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CommunityAdminServiceImpl implements CommunityAdminService {

    @Override
    public CommunityAdminResponse createAdmin(CommunityAdminRequest request) {
        throw new UnsupportedOperationException(
                "Community Admin module is under implementation."
        );
    }

    @Override
    public CommunityAdminResponse getAdmin(Long id) {
        throw new UnsupportedOperationException(
                "Community Admin module is under implementation."
        );
    }

    @Override
    public List<CommunityAdminResponse> getAllAdmins() {
        return List.of();
    }
}