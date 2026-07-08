package com.water.monitoring_and_billing_platform.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class InvalidInvitationTokenException extends RuntimeException {
    public InvalidInvitationTokenException() {
        super("Invalid or unrecognized invitation token.");
    }
}
