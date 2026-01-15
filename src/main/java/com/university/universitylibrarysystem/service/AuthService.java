package com.university.universitylibrarysystem.service;

import com.university.universitylibrarysystem.dto.AuthRequest;
import com.university.universitylibrarysystem.dto.AuthResponse;
import com.university.universitylibrarysystem.dto.StudentAuthRequest;
import com.university.universitylibrarysystem.dto.StudentRegisterRequest;
import com.university.universitylibrarysystem.entity.Librarian;
import com.university.universitylibrarysystem.entity.Student;
import com.university.universitylibrarysystem.repository.LibrarianRepository;
import com.university.universitylibrarysystem.repository.StudentRepository;
import com.university.universitylibrarysystem.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final LibrarianRepository librarianRepository;
    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(AuthenticationManager authenticationManager,
                       JwtService jwtService,
                       LibrarianRepository librarianRepository,
                       StudentRepository studentRepository,
                       PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.librarianRepository = librarianRepository;
        this.studentRepository = studentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // -------------------- LIBRARIAN --------------------
    public void registerLibrarian(AuthRequest request) {
        if (librarianRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new IllegalArgumentException("Username already exists");
        }

        Librarian librarian = new Librarian();
        librarian.setUsername(request.getUsername());
        librarian.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        librarian.setFirstName(request.getFirstName());
        librarian.setLastName(request.getLastName());
        librarian.setEmail(request.getEmail());
        librarian.setStaffId(request.getStaffId() != null && !request.getStaffId().isBlank()
                ? request.getStaffId()
                : request.getUsername());
        librarian.setRole(Librarian.Role.ADMIN); // Default role
        librarian.setActive(true);

        librarianRepository.save(librarian);
    }

    public AuthResponse authenticateLibrarian(AuthRequest request) {
        Librarian librarian = librarianRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        if (!passwordEncoder.matches(request.getPassword(), librarian.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid username or password");
        }

        // ✅ Remove manager-only restriction, allow any librarian role
        String token = jwtService.generateToken(librarian);

        return new AuthResponse(
                token,
                librarian.getUsername(),
                "ROLE_" + librarian.getRole().name() // Ensure JWT role format
        );
    }

    // -------------------- STUDENT --------------------
    public void registerStudent(StudentRegisterRequest request) {
        if (studentRepository.findByStudentId(request.getStudentId()).isPresent()) {
            throw new IllegalArgumentException("Student ID already exists");
        }
        if (studentRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already exists");
        }

        Student student = new Student();
        student.setStudentId(request.getStudentId());
        student.setPassword(passwordEncoder.encode(request.getPassword()));
        student.setUniversityCardId(request.getUniversityCardId());
        student.setFirstName(request.getFirstName());
        student.setLastName(request.getLastName());
        student.setEmail(request.getEmail());
        student.setDepartment(request.getDepartment());
        student.setPhotoUrl(request.getPhotoUrl());
        student.setFingerprintReference(request.getFingerprintReference());
        student.setRfidUid(request.getRfidUid());
        student.setPhoneNumber(request.getPhoneNumber());

        // ✅ Set student role explicitly
        student.setRole("ROLE_STUDENT");
        student.setActive(true);

        studentRepository.save(student);
    }

    public AuthResponse authenticateStudent(StudentAuthRequest request) {
        Student student = studentRepository.findByStudentId(request.getStudentId())
                .orElseThrow(() -> new UsernameNotFoundException("Student not found"));

        if (!passwordEncoder.matches(request.getPassword(), student.getPassword())) {
            throw new IllegalArgumentException("Invalid password");
        }

        String token = jwtService.generateTokenForStudent(student);

        return new AuthResponse(
                token,
                student.getStudentId(),
                "ROLE_STUDENT" // Ensure JWT role format
        );
    }
}
