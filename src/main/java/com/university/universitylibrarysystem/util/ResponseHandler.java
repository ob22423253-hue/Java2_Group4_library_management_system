package com.university.universitylibrarysystem.util;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.HashMap;
import java.util.Map;

/**
 * Utility class for generating consistent API responses.
 * 
 * This helps standardize the structure of success and error responses
 * across all controllers in the system.
 * 
 * Example response JSON:
 * {
 *   "status": 200,
 *   "success": true,
 *   "message": "Student created successfully",
 *   "data": { ... }
 * }
 */
public class ResponseHandler {

    /**
     * Generate a standardized response entity.
     *
     * @param message Response message
     * @param status HTTP status code
     * @param data Optional data payload
     * @return Standardized ResponseEntity object
     */
    public static ResponseEntity<Object> generateResponse(String message, HttpStatus status, Object data) {
        Map<String, Object> response = new HashMap<>();
        response.put("status", status.value());
        response.put("success", status.is2xxSuccessful());
        response.put("message", message);
        response.put("data", data);

        return new ResponseEntity<>(response, status);
    }

    /**
     * Shortcut for success response without data.
     */
    public static ResponseEntity<Object> success(String message) {
        return generateResponse(message, HttpStatus.OK, null);
    }

    /**
     * Shortcut for error response.
     */
    public static ResponseEntity<Object> error(String message, HttpStatus status) {
        return generateResponse(message, status, null);
    }
}
