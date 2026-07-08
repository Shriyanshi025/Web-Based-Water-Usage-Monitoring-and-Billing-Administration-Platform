package com.water.monitoring_and_billing_platform.exception;

public class CommunityAdminProfileNotFoundException extends RuntimeException {
    public CommunityAdminProfileNotFoundException() {
        super("Community Admin Profile not found");
    }
}
