package com.water.monitoring_and_billing_platform.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActivityLogDto {
    private Long id;
    private String title;
    private String description;
    private String time;
    private String icon;
    private String color;
}
