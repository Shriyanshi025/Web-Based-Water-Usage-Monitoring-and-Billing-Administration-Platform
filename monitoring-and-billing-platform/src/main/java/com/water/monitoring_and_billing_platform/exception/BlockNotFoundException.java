package com.water.monitoring_and_billing_platform.exception;

public class BlockNotFoundException extends RuntimeException {

    public BlockNotFoundException() {
        super("Block not found.");
    }

}
