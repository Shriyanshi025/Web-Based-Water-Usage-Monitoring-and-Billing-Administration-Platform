package com.water.monitoring_and_billing_platform.service;

import com.water.monitoring_and_billing_platform.dto.chatbot.ChatMessageRequest;
import com.water.monitoring_and_billing_platform.dto.chatbot.ChatMessageResponse;

public interface ChatbotService {
    ChatMessageResponse handleChatMessage(ChatMessageRequest request, String userEmail);
}
