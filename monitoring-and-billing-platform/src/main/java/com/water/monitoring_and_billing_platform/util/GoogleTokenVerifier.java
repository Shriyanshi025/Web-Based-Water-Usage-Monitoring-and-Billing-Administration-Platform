package com.water.monitoring_and_billing_platform.util;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Component
@Slf4j
public class GoogleTokenVerifier {

    @Value("${google.client-id:}")
    private String googleClientId;

    public Map<String, Object> verifyToken(String idToken) {
        try {
            RestTemplate restTemplate = new RestTemplate();
            String url = "https://oauth2.googleapis.com/tokeninfo?id_token=" + idToken;
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            
            if (response == null || !response.containsKey("email")) {
                throw new IllegalArgumentException("Invalid Google ID Token structure.");
            }
            
            // Validate client ID if configured
            if (googleClientId != null && !googleClientId.trim().isEmpty()) {
                String aud = (String) response.get("aud");
                if (aud == null || !aud.equals(googleClientId.trim())) {
                    log.error("Google Token Audience Mismatch: Expected {}, got {}", googleClientId, aud);
                    throw new IllegalArgumentException("Google ID Token audience mismatch.");
                }
            }

            // Verify email_verified is true
            Object emailVerified = response.get("email_verified");
            if (emailVerified == null || !emailVerified.toString().equalsIgnoreCase("true")) {
                throw new IllegalArgumentException("Google email is not verified.");
            }

            return response;
        } catch (Exception e) {
            log.error("Failed to verify Google Token: {}", e.getMessage());
            throw new IllegalArgumentException("Google ID Token validation failed: " + e.getMessage());
        }
    }
}
