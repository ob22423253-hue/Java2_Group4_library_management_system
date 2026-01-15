package com.university.universitylibrarysystem.util;

/**
 * Contains system-wide constants used throughout the University Library System.
 * 
 * This helps avoid duplication and makes it easy to update global values in one place.
 */
public class Constants {

    // === General App Info ===
    public static final String APP_NAME = "University Library System";
    public static final String DEFAULT_TIME_ZONE = "UTC";

    // === User Roles ===
    public static final String ROLE_ADMIN = "ADMIN";
    public static final String ROLE_LIBRARIAN = "LIBRARIAN";
    public static final String ROLE_STUDENT = "STUDENT";

    // === Messages ===
    public static final String MSG_SUCCESS = "Operation completed successfully";
    public static final String MSG_NOT_FOUND = "Resource not found";
    public static final String MSG_UNAUTHORIZED = "You are not authorized to perform this action";

    // === File Upload Paths ===
    public static final String FILE_UPLOAD_DIR = "uploads/";

    private Constants() {
        // Prevent instantiation
    }
}
