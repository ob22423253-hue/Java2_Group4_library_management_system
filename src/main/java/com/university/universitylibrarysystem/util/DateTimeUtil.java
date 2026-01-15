package com.university.universitylibrarysystem.util;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

/**
 * Utility class for date and time operations.
 * 
 * Provides helper methods to:
 * - Format timestamps consistently across the system.
 * - Handle time zone conversions.
 */
public class DateTimeUtil {

    // Default date-time pattern used throughout the system
    private static final String DEFAULT_PATTERN = "yyyy-MM-dd HH:mm:ss";

    /**
     * Formats a LocalDateTime using the default pattern.
     *
     * @param dateTime the LocalDateTime to format
     * @return formatted date-time string
     */
    public static String format(LocalDateTime dateTime) {
        if (dateTime == null) {
            return null;
        }
        return dateTime.format(DateTimeFormatter.ofPattern(DEFAULT_PATTERN));
    }

    /**
     * Gets the current date-time in a specific zone.
     *
     * @param zoneId target time zone
     * @return current date-time in that zone
     */
    public static LocalDateTime nowInZone(String zoneId) {
        return LocalDateTime.now(ZoneId.of(zoneId));
    }

    /**
     * Gets the current date-time in UTC.
     *
     * @return current UTC time
     */
    public static LocalDateTime nowUTC() {
        return LocalDateTime.now(ZoneId.of("UTC"));
    }

    private DateTimeUtil() {
        // Prevent instantiation
    }
}
