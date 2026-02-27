package com.university.universitylibrarysystem.dto;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
public class StudentDTO {

    private Long id;
    private String studentId;
    private String password;
    private String firstName;
    private String lastName;
    private String universityCardId;
    private String email;
    private String department;
    private String major;
    private String minorSubject;
    private Integer yearLevel;
    private String phoneNumber;
    private String photoUrl;
    private String fingerprintReference;
    private String rfidUid;
    private String role = "STUDENT";
    private boolean active;
}