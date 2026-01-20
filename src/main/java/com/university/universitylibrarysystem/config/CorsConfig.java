package com.university.universitylibrarysystem.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.List;

/**
 * Global CORS configuration.
 * 
 * This allows the frontend (e.g., React app) to communicate with the Spring Boot API.
 * Supports:
 * - Localhost development (HTTP)
 * - Local network testing from phones/tablets
 * - Production HTTPS domains
 */
@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);
        
        // Allow both localhost and local network IPs
        // Development: http://localhost:3000, http://127.0.0.1:3000
        // Mobile testing: http://192.168.x.x:3000
        // Production: Update with your HTTPS domain
        config.setAllowedOrigins(List.of(
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "http://localhost:3443",
            "https://localhost:3443"
        ));
        
        // For local network IPs (192.168.x.x), use regex if needed
        // Or add specific IPs as needed for mobile testing
        
        config.setAllowedHeaders(List.of("*"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        config.setMaxAge(3600L); // Cache preflight for 1 hour

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return new CorsFilter(source);
    }
}
