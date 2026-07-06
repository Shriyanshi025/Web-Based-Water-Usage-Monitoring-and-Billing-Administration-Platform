package com.water.monitoring_and_billing_platform.exception;

public class BlockAlreadyExistsException extends RuntimeException {

    public BlockAlreadyExistsException() {
        super("Block already exists in this community.");
    }

}