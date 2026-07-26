package com.water.monitoring_and_billing_platform;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class MonitoringAndBillingPlatformApplicationTests {

	@org.springframework.beans.factory.annotation.Autowired
	private com.water.monitoring_and_billing_platform.repository.UserRepository userRepository;

	@org.springframework.beans.factory.annotation.Autowired
	private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

	@Test
	void contextLoads() {
		userRepository.findByEmail("resident@example.com").ifPresent(user -> {
			boolean matches = passwordEncoder.matches("user12345", user.getPassword());
			System.out.println("==========================================");
			System.out.println("DIAGNOSTIC FOR resident@example.com:");
			System.out.println("Stored Hash: " + user.getPassword());
			System.out.println("passwordEncoder.matches('user12345', storedHash): " + matches);
			System.out.println("==========================================");
		});
	}
}
