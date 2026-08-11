package com.water.monitoring_and_billing_platform.controller;

import com.water.monitoring_and_billing_platform.dto.chatbot.ChatMessageRequest;
import com.water.monitoring_and_billing_platform.dto.chatbot.ChatMessageResponse;
import com.water.monitoring_and_billing_platform.service.ChatbotService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;

@RestController
@RequestMapping("/api/v1/chatbot")
@RequiredArgsConstructor
@CrossOrigin
public class ChatbotController {

    private final ChatbotService chatbotService;

    @PostMapping("/chat")
    public ResponseEntity<ChatMessageResponse> chat(
            @RequestBody ChatMessageRequest request,
            Principal principal) {
        String email = principal != null ? principal.getName() : null;
        ChatMessageResponse response = chatbotService.handleChatMessage(request, email);
        return ResponseEntity.ok(response);
    }
}
