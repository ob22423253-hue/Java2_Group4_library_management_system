package com.university.universitylibrarysystem.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "students")
@Getter
@Setter
@NoArgsConstructor
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "student_id", unique = true, nullable = false, length = 20)
    @NotBlank(message = "Student ID is required")
    @Pattern(regexp = "^[0-9]{8}$", message = "Student ID must be exactly 8 digits")
    private String studentId;

    @Column(nullable = false)
    @NotBlank(message = "Password is required")
    private String password;

    @Column(name = "university_card_id", unique = true, nullable = false, length = 50)
    @NotBlank(message = "University Card ID is required")
    private String universityCardId;

    @Column(name = "first_name", nullable = false, length = 50)
    @NotBlank(message = "First name is required")
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 50)
    @NotBlank(message = "Last name is required")
    private String lastName;

    @Column(unique = true, nullable = false)
    @Email(message = "Must be a valid email address")
    @NotBlank(message = "Email is required")
    private String email;

    @Column(name = "phone_number", length = 20)
    @Pattern(regexp = "^\\+?[0-9]{7,15}$", message = "Phone number must be 7–15 digits and may start with +")
    private String phoneNumber;

    @Column(nullable = false, length = 100)
    @NotBlank(message = "Department is required")
    private String department;

    @Column(name = "major", length = 100)
    private String major;

    @Column(name = "minor_subject", length = 100)
    private String minorSubject;

    @Column(name = "year_level")
    private Integer yearLevel;

    @Column(name = "photo_url")
    private String photoUrl;

    @Column(name = "fingerprint_ref")
    private String fingerprintReference;

    @Column(name = "rfid_uid", unique = true)
    private String rfidUid;

    @Column(name = "role", nullable = false, length = 30)
    private String role = "ROLE_STUDENT";

    @Column(nullable = false)
    private boolean active = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}