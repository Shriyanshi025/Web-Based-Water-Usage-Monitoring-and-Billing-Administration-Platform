package com.water.monitoring_and_billing_platform.exception;

public class WaterMeterAlreadyExistsException extends RuntimeException {

    public WaterMeterAlreadyExistsException() {
        super("Water Meter already assigned.");
    }

}