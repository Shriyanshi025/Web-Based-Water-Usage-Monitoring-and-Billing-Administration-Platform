package com.water.monitoring_and_billing_platform.exception;

public class WaterUsageNotFoundException extends RuntimeException {

    public WaterUsageNotFoundException() {
        super("Water usage record not found.");
    }

}
