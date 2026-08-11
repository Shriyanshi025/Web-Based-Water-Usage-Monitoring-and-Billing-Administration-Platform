package com.water.monitoring_and_billing_platform.dto.chatbot;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageResponse {
    private String answer;
    private List<String> sources;
    private String intent;
    private Map<String, Object> metadata;
}
