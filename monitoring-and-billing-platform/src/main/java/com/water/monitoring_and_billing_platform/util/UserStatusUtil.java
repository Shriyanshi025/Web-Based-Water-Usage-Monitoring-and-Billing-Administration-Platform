package com.water.monitoring_and_billing_platform.util;

import com.water.monitoring_and_billing_platform.entity.User;
import com.water.monitoring_and_billing_platform.enums.Role;

import java.time.LocalDateTime;

public class UserStatusUtil {

    private UserStatusUtil() {
        // Utility class private constructor
    }

    /**
     * Determines whether a user is active according to the business rules:
     * 1. MAIN_ADMIN: Always active.
     * 2. COMMUNITY_ADMIN & USER (Resident): Active if last login is within the last 15 days,
     *    Inactive if last login is older than 15 days or null (never logged in).
     */
    public static boolean calculateActiveStatus(User user) {
        if (user == null) {
            return false;
        }

        if (user.getRole() == Role.MAIN_ADMIN) {
            return true;
        }

        LocalDateTime lastLogin = user.getLastLogin();
        if (lastLogin == null) {
            return false;
        }

        return !lastLogin.isBefore(LocalDateTime.now().minusDays(15));
    }
}
