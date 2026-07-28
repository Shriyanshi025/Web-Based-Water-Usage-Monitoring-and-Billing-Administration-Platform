package com.water.monitoring_and_billing_platform.util;

import com.water.monitoring_and_billing_platform.entity.User;
import com.water.monitoring_and_billing_platform.enums.Role;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class UserStatusUtilTest {

    @Test
    @DisplayName("Main Admin should ALWAYS be active regardless of last login")
    void mainAdmin_alwaysActive() {
        User mainAdminNullLogin = User.builder().role(Role.MAIN_ADMIN).lastLogin(null).build();
        User mainAdminOldLogin = User.builder().role(Role.MAIN_ADMIN).lastLogin(LocalDateTime.now().minusDays(100)).build();
        User mainAdminRecentLogin = User.builder().role(Role.MAIN_ADMIN).lastLogin(LocalDateTime.now().minusDays(1)).build();

        assertTrue(UserStatusUtil.calculateActiveStatus(mainAdminNullLogin));
        assertTrue(UserStatusUtil.calculateActiveStatus(mainAdminOldLogin));
        assertTrue(UserStatusUtil.calculateActiveStatus(mainAdminRecentLogin));
    }

    @Test
    @DisplayName("Community Admin active within 15 days, inactive older than 15 days or never logged in")
    void communityAdmin_statusRules() {
        User neverLoggedIn = User.builder().role(Role.COMMUNITY_ADMIN).lastLogin(null).build();
        User oldLogin = User.builder().role(Role.COMMUNITY_ADMIN).lastLogin(LocalDateTime.now().minusDays(16)).build();
        User recentLogin = User.builder().role(Role.COMMUNITY_ADMIN).lastLogin(LocalDateTime.now().minusDays(5)).build();

        assertFalse(UserStatusUtil.calculateActiveStatus(neverLoggedIn));
        assertFalse(UserStatusUtil.calculateActiveStatus(oldLogin));
        assertTrue(UserStatusUtil.calculateActiveStatus(recentLogin));
    }

    @Test
    @DisplayName("Resident active within 15 days, inactive older than 15 days or never logged in")
    void resident_statusRules() {
        User neverLoggedIn = User.builder().role(Role.USER).lastLogin(null).build();
        User oldLogin = User.builder().role(Role.USER).lastLogin(LocalDateTime.now().minusDays(20)).build();
        User recentLogin = User.builder().role(Role.USER).lastLogin(LocalDateTime.now().minusDays(2)).build();

        assertFalse(UserStatusUtil.calculateActiveStatus(neverLoggedIn));
        assertFalse(UserStatusUtil.calculateActiveStatus(oldLogin));
        assertTrue(UserStatusUtil.calculateActiveStatus(recentLogin));
    }
}
