package com.water.monitoring_and_billing_platform.exception;

public class InvalidPasswordException extends RuntimeException {

    public InvalidPasswordException() {
        super("Invalid Password");
    }

}
