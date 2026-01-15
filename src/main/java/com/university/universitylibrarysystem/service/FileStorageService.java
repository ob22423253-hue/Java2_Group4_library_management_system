package com.university.universitylibrarysystem.service;

import com.university.universitylibrarysystem.config.StorageProperties;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.FileSystemUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.util.Objects;
import java.util.UUID;

/**
 * Handles all file storage operations (upload, load, delete).
 * Uses local file system by default; S3/MinIO integration can be added later.
 */
@Slf4j
@Service
public class FileStorageService {

    private final Path rootLocation;
    private final StorageProperties properties;

    public FileStorageService(StorageProperties properties) {
        this.properties = properties;
        this.rootLocation = Paths.get(properties.getLocation()).toAbsolutePath().normalize();
    }

    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(rootLocation);
            log.info("✅ File storage initialized at: {}", rootLocation);
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize storage location", e);
        }
    }

    public String storeFile(MultipartFile file, String subFolder) {
        if (file.isEmpty()) {
            throw new RuntimeException("Cannot store empty file");
        }

        validateFileType(file);

        try {
            Path destinationDir = rootLocation.resolve(subFolder).normalize();
            Files.createDirectories(destinationDir);

            String originalFilename = Objects.requireNonNull(file.getOriginalFilename());
            String extension = originalFilename.contains(".")
                    ? originalFilename.substring(originalFilename.lastIndexOf('.'))
                    : "";

            String filename = UUID.randomUUID() + extension;
            Path destinationFile = destinationDir.resolve(filename).normalize();

            file.transferTo(destinationFile);

            log.info("📁 Stored file: {}", destinationFile);
            return destinationFile.toString();

        } catch (IOException e) {
            throw new RuntimeException("Failed to store file", e);
        }
    }

    private void validateFileType(MultipartFile file) {
        String type = file.getContentType();
        boolean allowed = false;
        for (String allowedType : properties.getAllowedTypes()) {
            if (Objects.equals(type, allowedType)) {
                allowed = true;
                break;
            }
        }
        if (!allowed) {
            throw new RuntimeException("Unsupported file type: " + type);
        }
    }

    public Resource loadFile(String filePath) {
        try {
            Path file = Paths.get(filePath).normalize();
            Resource resource = new UrlResource(file.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            }
            throw new RuntimeException("Could not read file: " + filePath);
        } catch (MalformedURLException e) {
            throw new RuntimeException("Invalid file path: " + filePath, e);
        }
    }

    public void deleteAll() {
        try {
            FileSystemUtils.deleteRecursively(rootLocation);
        } catch (IOException e) {
            log.error("❌ Failed to delete storage directory", e);
        }
    }
}
