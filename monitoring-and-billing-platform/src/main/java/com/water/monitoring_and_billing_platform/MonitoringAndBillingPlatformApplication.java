package com.water.monitoring_and_billing_platform;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.water.monitoring_and_billing_platform.repository.UserRepository;
import com.water.monitoring_and_billing_platform.entity.User;
import org.springframework.context.annotation.Profile;

@SpringBootApplication
public class MonitoringAndBillingPlatformApplication {

	public static void main(String[] args) {
		SpringApplication.run(MonitoringAndBillingPlatformApplication.class, args);
	}

	@Profile("dev")
	@Bean
	CommandLineRunner resetAdminPassword(UserRepository userRepository, PasswordEncoder passwordEncoder) {
		return args -> {
			for (User u : userRepository.findAll()) {
				u.setPassword(passwordEncoder.encode("password123"));
				userRepository.save(u);
			}
		};
	}
}
