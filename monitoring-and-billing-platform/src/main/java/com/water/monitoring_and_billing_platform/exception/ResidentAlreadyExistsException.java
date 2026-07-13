package com.water.monitoring_and_billing_platform.exception;

public class ResidentAlreadyExistsException extends RuntimeException {

    public ResidentAlreadyExistsException() {
        super("Resident profile already exists for this user.");
    }

}
