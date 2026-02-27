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
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
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
        librarian.setRole(Librarian.Role.ADMIN);
        librarian.setActive(true);

        librarianRepository.save(librarian);
    }

    public AuthResponse authenticateLibrarian(AuthRequest request) {
    Librarian librarian = librarianRepository.findByUsername(request.getUsername())
            .orElseThrow(() -> new UsernameNotFoundException("User not found"));

    if (!passwordEncoder.matches(request.getPassword(), librarian.getPasswordHash())) {
        throw new IllegalArgumentException("Invalid username or password");
    }

    String token = jwtService.generateToken(librarian);

    AuthResponse response = new AuthResponse();
    response.setToken(token);
    response.setUsername(librarian.getUsername());
    response.setRole("ROLE_" + librarian.getRole().name());
    return response;
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
        student.setUniversityCardId("UTG-" + request.getStudentId());
        student.setFirstName(request.getFirstName());
        student.setLastName(request.getLastName());
        student.setEmail(request.getEmail());
        student.setDepartment(request.getDepartment());
        student.setMajor(request.getMajor());
        student.setMinorSubject(request.getMinorSubject());
        student.setYearLevel(request.getYearLevel());
        student.setPhotoUrl(request.getPhotoUrl());
        student.setFingerprintReference(request.getFingerprintReference());
        student.setRfidUid(request.getRfidUid());
        student.setPhoneNumber(request.getPhoneNumber());
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

        AuthResponse response = new AuthResponse();
        response.setToken(token);
        response.setUsername(student.getStudentId());
        response.setRole("ROLE_STUDENT");
        response.setId(student.getId());
        response.setStudentId(student.getStudentId());
        response.setFirstName(student.getFirstName());
        response.setLastName(student.getLastName());
        response.setEmail(student.getEmail());
        response.setDepartment(student.getDepartment());
        response.setMajor(student.getMajor());
        response.setMinorSubject(student.getMinorSubject());
        response.setYearLevel(student.getYearLevel());
        response.setPhoneNumber(student.getPhoneNumber());

        return response;
    }
}