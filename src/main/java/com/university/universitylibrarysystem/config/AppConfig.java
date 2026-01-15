package com.university.universitylibrarysystem.config;

import org.modelmapper.ModelMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;
import java.util.TimeZone;

/**
 * Global application configuration.
 * 
 * This class defines common beans (like ModelMapper)
 * and sets up the default timezone for the entire application.
 */
@Configuration
public class AppConfig {

    /**
     * Defines a single ModelMapper bean for DTO <-> Entity mapping.
     *
     * @return ModelMapper instance
     */
    @Bean
    public ModelMapper modelMapper() {
        return new ModelMapper();
    }

    /**
     * Set the default timezone for the application.
     * This ensures all date/time operations are consistent.
     */
    @PostConstruct
    public void init() {
        TimeZone.setDefault(TimeZone.getTimeZone("UTC"));
        System.out.println("✅ Default timezone set to UTC");
    }
}

