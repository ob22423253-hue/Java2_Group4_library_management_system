package com.university.universitylibrarysystem.dto;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StudentRegisterRequest {

    @NotBlank(message = "Student ID is required")
    @Pattern(regexp = "^[0-9]{8}$", message = "Student ID must be exactly 8 digits")
    private String studentId;

    @NotBlank(message = "Password is required")
    private String password;

    private String universityCardId;

    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    @Email(message = "Must be a valid email address")
    @NotBlank(message = "Email is required")
    private String email;

    @NotBlank(message = "Department is required")
    private String department;

    private String major;
    private String minorSubject;
    private Integer yearLevel;

    private String photoUrl;
    private String fingerprintReference;
    private String rfidUid;

    @Pattern(regexp = "^\\+?[0-9]{7,15}$", message = "Phone number must be 7–15 digits and may start with +")
    private String phoneNumber;
}