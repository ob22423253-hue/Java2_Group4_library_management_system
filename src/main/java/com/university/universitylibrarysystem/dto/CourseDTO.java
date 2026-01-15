package com.university.universitylibrarysystem.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

/**
 * DTO for Course entity.
 * Represents course data without exposing internal JPA details.
 */
@Data
public class CourseDTO {

    private Long id;

    @NotBlank(message = "Course name is required")
    @Size(max = 150, message = "Course name cannot exceed 150 characters")
    private String name;

    private Long departmentId; // Reference to Department

    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;
}
