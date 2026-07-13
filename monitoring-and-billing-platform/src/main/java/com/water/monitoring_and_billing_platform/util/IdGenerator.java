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

    public static String generateOfficialResidentId(
            String communityCode,
            String blockName,
            String unitNumber,
            long sequence) {
        return "RS-"
                + communityCode.toUpperCase()
                + "-"
                + blockName.toUpperCase()
                + "-"
                + unitNumber.toUpperCase()
                + "-"
                + String.format("%04d", sequence);
    }

    public static String generateOfficialCommunityAdminId(
            String communityCode,
            long sequence) {
        return "CA-"
                + communityCode.toUpperCase()
                + "-"
                + String.format("%04d", sequence);
    }

}
