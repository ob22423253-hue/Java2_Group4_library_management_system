package com.university.universitylibrarysystem.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StudentRegisterRequest {
    private String studentId;
    private String password;
    private String universityCardId;
    private String firstName;
    private String lastName;
    private String email;
    private String department;
    private String photoUrl;
    private String fingerprintReference;
    private String rfidUid;
    private String phoneNumber;
}
