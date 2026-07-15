package com.water.monitoring_and_billing_platform.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class InvitationRevokedException extends RuntimeException {
    public InvitationRevokedException() {
        super("This invitation has been revoked.");
    }
}
