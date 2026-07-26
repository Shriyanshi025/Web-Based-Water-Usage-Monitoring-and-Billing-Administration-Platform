package com.water.monitoring_and_billing_platform;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@EnableAsync
public class MonitoringAndBillingPlatformApplication {

	public static void main(String[] args) {
		SpringApplication.run(MonitoringAndBillingPlatformApplication.class, args);
	}
}
