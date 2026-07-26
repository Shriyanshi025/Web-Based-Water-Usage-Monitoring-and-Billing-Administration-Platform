package com.water.monitoring_and_billing_platform.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmailPreferenceDto {
    private boolean billEmails;
    private boolean alertEmails;
    private boolean reminderEmails;
    private boolean announcementEmails;
}
