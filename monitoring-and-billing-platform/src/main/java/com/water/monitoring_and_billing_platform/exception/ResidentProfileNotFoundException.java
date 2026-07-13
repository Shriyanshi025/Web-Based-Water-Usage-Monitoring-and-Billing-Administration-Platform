package com.water.monitoring_and_billing_platform.exception;

public class ResidentProfileNotFoundException extends RuntimeException {

    public ResidentProfileNotFoundException() {
        super("Resident profile not found.");
    }

}
