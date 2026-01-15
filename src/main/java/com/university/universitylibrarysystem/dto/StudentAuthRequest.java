package com.university.universitylibrarysystem.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StudentAuthRequest {
    private String studentId; // or use email if you prefer
    private String password;
}
