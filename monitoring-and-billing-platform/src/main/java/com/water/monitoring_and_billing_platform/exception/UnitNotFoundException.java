package com.water.monitoring_and_billing_platform.exception;

public class UnitNotFoundException extends RuntimeException {

    public UnitNotFoundException() {
        super("Unit not found.");
    }

}