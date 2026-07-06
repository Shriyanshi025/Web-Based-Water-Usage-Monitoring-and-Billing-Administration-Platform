package com.water.monitoring_and_billing_platform.util;

public class IdGenerator {

    private IdGenerator() {
    }

    public static String generateOfficialUserId(
            String communityCode,
            String blockName,
            String unitNumber) {

        return "WM-"
                + communityCode.toUpperCase()
                + "-"
                + blockName.toUpperCase()
                + "-"
                + unitNumber;
    }

}