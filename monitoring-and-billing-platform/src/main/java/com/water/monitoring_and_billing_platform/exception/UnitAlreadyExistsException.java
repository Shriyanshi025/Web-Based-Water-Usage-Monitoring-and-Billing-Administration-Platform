package com.water.monitoring_and_billing_platform.exception;

public class UnitAlreadyExistsException extends RuntimeException {

    public UnitAlreadyExistsException() {
        super("Unit already exists in this block.");
    }

}