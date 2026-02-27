package com.university.universitylibrarysystem.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
public class AuthResponse {
    private String token;
    private String username;
    private String role;

    // Full student profile (only populated on student login)
    private Long id;
    private String studentId;
    private String firstName;
    private String lastName;
    private String email;
    private String department;
    private String major;
    private String minorSubject;
    private Integer yearLevel;
    private String phoneNumber;
}