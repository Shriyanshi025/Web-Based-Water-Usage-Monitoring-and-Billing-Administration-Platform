package com.water.monitoring_and_billing_platform.scheduler;

import com.water.monitoring_and_billing_platform.service.AlertService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class AlertScheduler {

    private final AlertService alertService;

    // Run by default every 1 hour (3600000 ms), configurable via properties
    @Scheduled(fixedDelayString = "${app.alert.delay-ms:3600000}")
    public void runAlertChecks() {
        log.info("AlertScheduler: Starting automated alert detection job...");
        try {
            alertService.processScheduledAlerts();
            log.info("AlertScheduler: Completed automated alert detection job successfully.");
        } catch (Exception e) {
            log.error("AlertScheduler: Failed to run alert checks.", e);
        }
    }
}
