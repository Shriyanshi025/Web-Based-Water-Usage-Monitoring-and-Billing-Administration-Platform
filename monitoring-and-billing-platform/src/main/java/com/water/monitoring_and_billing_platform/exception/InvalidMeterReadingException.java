package com.water.monitoring_and_billing_platform.exception;

public class InvalidMeterReadingException extends RuntimeException {

    public InvalidMeterReadingException() {
        super("Current reading must be greater than or equal to previous reading.");
    }

}
