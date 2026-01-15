package com.university.universitylibrarysystem.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

/**
 * DTO for Department entity.
 * Used to safely transfer department data between client and server.
 */
@Data
public class DepartmentDTO {

    private Long id;

    @NotBlank(message = "Department name is required")
    @Size(max = 150, message = "Department name cannot exceed 150 characters")
    private String name;

    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;
}
