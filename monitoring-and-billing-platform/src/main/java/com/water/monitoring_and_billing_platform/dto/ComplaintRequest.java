package com.water.monitoring_and_billing_platform.dto;

import com.water.monitoring_and_billing_platform.enums.ComplaintCategory;
import com.water.monitoring_and_billing_platform.enums.ComplaintPriority;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComplaintRequest {
    private ComplaintCategory category;
    private ComplaintPriority priority;
    private String description;
}
