package com.university.universitylibrarysystem.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

/**
 * DTO for StudentMajorMinor entity.
 * Connects student with their major and minor departments.
 */
@Data
public class StudentMajorMinorDTO {

    private Long id;

    @NotNull(message = "Student ID is required")
    private Long studentId;

    @NotNull(message = "Major department ID is required")
    private Long majorDepartmentId;

    private Long minorDepartmentId; // Optional
}
