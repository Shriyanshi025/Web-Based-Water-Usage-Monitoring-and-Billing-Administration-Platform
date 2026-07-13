package com.water.monitoring_and_billing_platform.exception;

public class DuplicateWaterUsageException extends RuntimeException {

    public DuplicateWaterUsageException() {
        super("A water usage entry with the same meter, date, and reading already exists.");
    }
}
