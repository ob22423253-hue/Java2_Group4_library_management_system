package com.university.universitylibrarysystem.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration properties for file storage.
 * Supports both local and cloud (future S3/MinIO) options.
 *
 * Example (application.yml):
 * storage:
 *   location: uploads
 *   max-file-size: 10MB
 *   allowed-types:
 *     - image/jpeg
 *     - image/png
 */
@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix = "storage")
public class StorageProperties {

    /**
     * The root directory for storing uploaded files.
     */
    private String location = "uploads";

    /**
     * Maximum allowed file size (e.g., 10MB).
     */
    private String maxFileSize = "10MB";

    /**
     * Allowed MIME types for uploaded files.
     */
    private String[] allowedTypes = new String[] {"image/jpeg", "image/png"};
}
