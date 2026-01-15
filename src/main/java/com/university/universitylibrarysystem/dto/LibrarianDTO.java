package com.university.universitylibrarysystem.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.util.Set;

@Data
public class LibrarianDTO {
    private Long id;

    @NotBlank(message = "Staff ID is required")
    @Size(max = 20)
    private String staffId;

    @NotBlank(message = "Username is required")
    @Size(min = 4, max = 50)
    private String username;

    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    @Email(message = "Must be a valid email")
    @NotBlank(message = "Email is required")
    private String email;

    @NotNull(message = "Role is required")
    private String role;

    private String photoUrl;
    private Set<String> certifications;
    private String department;
}