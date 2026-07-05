package com.water.monitoring_and_billing_platform.exception;

public class CommunityNotFoundException extends RuntimeException {

    public CommunityNotFoundException() {
        super("Community not found");
    }

}