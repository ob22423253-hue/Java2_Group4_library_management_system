package com.university.universitylibrarysystem.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * DTO representing library in/out event.
 */
@Data
public class LibraryEntryDTO {

    private Long id;

    @NotNull(message = "Student ID is required")
    private Long studentId;

    @NotBlank(message = "Entry type is required")
    @Pattern(regexp = "^(IN|OUT)$", message = "Entry type must be either IN or OUT")
    private String entryType;

    // Timestamp is optional from client; controller will set current time when missing
    private LocalDateTime timestamp;

    private String gateLocation;

    private String notes;
}
