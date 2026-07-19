package com.water.monitoring_and_billing_platform.dto;

import com.water.monitoring_and_billing_platform.enums.ComplaintCategory;
import com.water.monitoring_and_billing_platform.enums.ComplaintPriority;
import com.water.monitoring_and_billing_platform.enums.ComplaintStatus;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComplaintResponse {
    private Long id;
    private String ticketNumber;
    private Long residentId;
    private String residentName;
    private Long communityId;
    private String communityName;
    private ComplaintCategory category;
    private ComplaintPriority priority;
    private ComplaintStatus status;
    private String description;
    private String remarks;
    private Long assignedToId;
    private String assignedToName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime resolvedAt;
    private Long lastUpdatedById;
    private String lastUpdatedByName;
}
