package com.water.monitoring_and_billing_platform.service;

import com.water.monitoring_and_billing_platform.dto.AlertResponse;
import com.water.monitoring_and_billing_platform.dto.AlertStatisticsResponse;
import com.water.monitoring_and_billing_platform.dto.SystemAnnouncementRequest;

import java.util.List;

public interface AlertService {
    List<AlertResponse> getMyAlerts(String email);
    List<AlertResponse> getCommunityAlerts(String email, Long communityId);
    AlertResponse getAlertById(String email, Long id);
    AlertResponse markAsRead(String email, Long id);
    AlertResponse resolveAlert(String email, Long id);
    AlertResponse createSystemAnnouncement(String email, SystemAnnouncementRequest request);
    AlertStatisticsResponse getStatistics(String email);
    void processScheduledAlerts();
    void generatePaymentSuccessAlert(Long billId);
    void generatePaymentFailedAlert(Long billId, String reason);
    void markAllAsRead(String email);
    void createInAppNotification(
            com.water.monitoring_and_billing_platform.entity.User recipient,
            com.water.monitoring_and_billing_platform.entity.ResidentProfile resident,
            com.water.monitoring_and_billing_platform.entity.Community community,
            String title,
            String message,
            com.water.monitoring_and_billing_platform.enums.AlertType alertType,
            com.water.monitoring_and_billing_platform.enums.AlertSeverity severity,
            Long relatedBillId
    );
}
