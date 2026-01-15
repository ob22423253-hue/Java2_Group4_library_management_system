package com.university.universitylibrarysystem.controller;

import com.university.universitylibrarysystem.dto.StudentAuthRequest;
import com.university.universitylibrarysystem.dto.StudentRegisterRequest;
import com.university.universitylibrarysystem.dto.AuthResponse;
import com.university.universitylibrarysystem.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth/student")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000", allowedHeaders = "*", methods = {RequestMethod.POST, RequestMethod.OPTIONS})
public class StudentAuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<String> registerStudent(@Valid @RequestBody StudentRegisterRequest request) {
        authService.registerStudent(request);
        return ResponseEntity.status(HttpStatus.CREATED).body("Student registered successfully");
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> loginStudent(@Valid @RequestBody StudentAuthRequest request) {
        AuthResponse response = authService.authenticateStudent(request);
        return ResponseEntity.ok(response);
    }
}
