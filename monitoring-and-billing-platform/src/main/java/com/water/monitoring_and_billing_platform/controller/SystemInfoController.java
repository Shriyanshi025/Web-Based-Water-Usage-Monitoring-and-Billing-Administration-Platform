package com.water.monitoring_and_billing_platform.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.core.env.Environment;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.net.URI;
import java.sql.Connection;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/system")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SystemInfoController {

    private final Environment environment;
    private final DataSource dataSource;

    @GetMapping("/datasource-info")
    public ResponseEntity<Map<String, Object>> getDatasourceInfo() {
        Map<String, Object> info = new HashMap<>();
        info.put("activeProfiles", environment.getActiveProfiles().length > 0 
                ? environment.getActiveProfiles() 
                : environment.getDefaultProfiles());

        try (Connection connection = dataSource.getConnection()) {
            var metaData = connection.getMetaData();
            String rawUrl = metaData.getURL();
            info.put("databaseProductName", metaData.getDatabaseProductName());
            info.put("databaseProductVersion", metaData.getDatabaseProductVersion());
            info.put("driverName", metaData.getDriverName());
            info.put("url", rawUrl);
            info.put("user", metaData.getUserName());

            // Extract Host, Port, and Database Name for clean verification output
            if (rawUrl != null && rawUrl.startsWith("jdbc:")) {
                String cleanUrl = rawUrl.substring(5);
                URI uri = URI.create(cleanUrl);
                info.put("host", uri.getHost() != null ? uri.getHost() : "localhost");
                info.put("port", uri.getPort() != -1 ? uri.getPort() : 5432);
                String path = uri.getPath();
                info.put("database", (path != null && path.length() > 1) ? path.substring(1) : "water_monitoring_db");
            }
        } catch (Exception e) {
            info.put("error", e.getMessage());
        }

        return ResponseEntity.ok(info);
    }
}
