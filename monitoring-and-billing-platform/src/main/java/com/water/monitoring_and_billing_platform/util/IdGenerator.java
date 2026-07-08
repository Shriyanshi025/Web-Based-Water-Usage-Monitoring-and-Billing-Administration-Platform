package com.water.monitoring_and_billing_platform.util;

public class IdGenerator {

    private IdGenerator() {
    }

    public static String generateResidentId(
            String communityCode,
            String blockName,
            String unitNumber) {

        return "R-"
                + communityCode.toUpperCase()
                + "-"
                + blockName.toUpperCase()
                + "-"
                + unitNumber;
    }

    public static String generateCommunityAdminId(
            String communityCode) {

        return "CA-"
                + communityCode.toUpperCase()
                + "-001";
    }

}