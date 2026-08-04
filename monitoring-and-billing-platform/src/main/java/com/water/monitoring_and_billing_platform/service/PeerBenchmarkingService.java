package com.water.monitoring_and_billing_platform.service;

import com.water.monitoring_and_billing_platform.dto.PeerBenchmarkingResponse;

public interface PeerBenchmarkingService {
    PeerBenchmarkingResponse getResidentPeerBenchmarking(String email);
}
