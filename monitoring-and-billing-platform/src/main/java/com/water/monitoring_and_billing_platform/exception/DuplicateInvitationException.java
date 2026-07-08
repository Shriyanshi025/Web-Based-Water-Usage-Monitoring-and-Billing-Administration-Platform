package com.water.monitoring_and_billing_platform.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class DuplicateInvitationException extends RuntimeException {
    public DuplicateInvitationException() {
        super("An active invitation already exists for this email or mobile number.");
    }
}
