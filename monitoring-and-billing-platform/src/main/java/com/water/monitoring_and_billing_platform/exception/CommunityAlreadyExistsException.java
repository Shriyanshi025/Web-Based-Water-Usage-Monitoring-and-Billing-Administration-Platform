package com.water.monitoring_and_billing_platform.exception;

public class CommunityAlreadyExistsException extends RuntimeException {

    public CommunityAlreadyExistsException() {
        super("Community already exists");
    }

}
