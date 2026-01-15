package com.university.universitylibrarysystem.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class StudentDTO {

    private Long id;

    @NotBlank(message = "Student ID is required")
    @Pattern(regexp = "^[0-9]{8}$", message = "Student ID must be exactly 8 digits")
    private String studentId;

    @NotBlank(message = "Password is required")
    @Size(min = 6, max = 100, message = "Password must be between 6 and 100 characters")
    private String password;

    @NotBlank(message = "First name is required")
    @Size(max = 100, message = "First name must not exceed 100 characters")
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(max = 100, message = "Last name must not exceed 100 characters")
    private String lastName;

    @NotBlank(message = "University Card ID is required")
    @Pattern(regexp = "^[A-Z]{2,4}-\\d{3,5}$", message = "Card ID must be like UTG-12345")
    private String universityCardId;

    @Email(message = "Invalid email format")
    @NotBlank(message = "Email is required")
    private String email;

    @NotBlank(message = "Department is required")
    @Size(max = 100, message = "Department must not exceed 100 characters")
    private String department;

    @NotNull(message = "Year level is required")
    @Min(value = 1, message = "Minimum year level is 1")
    @Max(value = 8, message = "Maximum year level is 8")
    private Integer yearLevel;

    @Pattern(regexp = "^[0-9]{7,15}$", message = "Phone number must contain 7–15 digits")
    private String phoneNumber;

    private String photoUrl;

    private String fingerprintReference;

    private String rfidUid;

    private String role = "STUDENT";

    private boolean active; // <-- FIXED
}
