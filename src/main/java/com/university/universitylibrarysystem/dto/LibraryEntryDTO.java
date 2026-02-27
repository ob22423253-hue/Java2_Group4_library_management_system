package com.university.universitylibrarysystem.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class LibraryEntryDTO {

    private Long id;

    @NotNull(message = "Student ID is required")
    private Long studentId;

    private StudentDTO student;

    @NotBlank(message = "Entry type is required")
    @Pattern(regexp = "^(IN|OUT)$", message = "Entry type must be either IN or OUT")
    private String entryType;

    private LocalDateTime timestamp;
    private LocalDateTime entryTime;
    private LocalDateTime exitTime;

    private String gateLocation;
    private String notes;
}