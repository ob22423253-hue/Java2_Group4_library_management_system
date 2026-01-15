package com.university.universitylibrarysystem.controller;

import com.university.universitylibrarysystem.dto.AuthRequest;
import com.university.universitylibrarysystem.dto.AuthResponse;
import com.university.universitylibrarysystem.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<String> register(@Valid @RequestBody AuthRequest request) {
        authService.registerLibrarian(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body("Staff registered successfully");
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest request) {
        return ResponseEntity.ok(
                authService.authenticateLibrarian(request)
        );
    }
}
