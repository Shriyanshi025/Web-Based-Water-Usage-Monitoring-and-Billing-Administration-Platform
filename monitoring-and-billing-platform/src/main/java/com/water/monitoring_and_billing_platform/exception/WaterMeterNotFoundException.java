package com.water.monitoring_and_billing_platform.exception;

public class WaterMeterNotFoundException extends RuntimeException {

    public WaterMeterNotFoundException() {
        super("Water Meter not found.");
    }

}