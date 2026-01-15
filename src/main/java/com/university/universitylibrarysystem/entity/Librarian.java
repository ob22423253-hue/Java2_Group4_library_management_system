package com.university.universitylibrarysystem.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.*;

@Entity
@Table(name = "librarians")
@Getter @Setter @NoArgsConstructor
public class Librarian implements UserDetails {

    public enum Role {
        ADMIN("ROLE_ADMIN"),
        LIBRARIAN("ROLE_LIBRARIAN"),
        ASSISTANT("ROLE_ASSISTANT");

        private final String value;

        Role(String value) {
            this.value = value;
        }

        public String getValue() {
            return value;
        }

        public static Role fromValue(String value) {
            for (Role role : Role.values()) {
                if (role.value.equals(value)) return role;
            }
            throw new IllegalArgumentException("Unknown role: " + value);
        }
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "staff_id", unique = true, nullable = false, length = 20)
    @NotBlank
    private String staffId;

    @Column(unique = true, nullable = false, length = 50)
    @NotBlank
    private String username;

    @Column(nullable = false)
    @NotBlank
    private String passwordHash;

    @Column(nullable = false, length = 50)
    @NotBlank
    private String firstName;

    @Column(nullable = false, length = 50)
    @NotBlank
    private String lastName;

    @Column(unique = true, nullable = false)
    @Email
    @NotBlank
    private String email;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    @NotNull
    private Role role;

    @Column(nullable = false)
    private boolean active = true;

    @Column(name = "photo_url")
    private String photoUrl;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "last_login")
    private LocalDateTime lastLogin;

    @Column(name = "department")
    private String department;

    @Column(name = "termination_date")
    private LocalDateTime terminationDate;

    @ElementCollection
    @CollectionTable(name = "librarian_certifications", joinColumns = @JoinColumn(name = "librarian_id"))
    @Column(name = "certification")
    private Set<String> certifications = new HashSet<>();

    @ElementCollection
    @CollectionTable(name = "librarian_certification_expiry", joinColumns = @JoinColumn(name = "librarian_id"))
    @MapKeyColumn(name = "certification")
    @Column(name = "expiry_date")
    private Map<String, LocalDateTime> certificationExpiryDates = new HashMap<>();

    @Column(name = "password_reset_required")
    private boolean passwordResetRequired = false;

    @Column(name = "lock_reason")
    private String lockReason;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public String getFullName() {
        return firstName + " " + lastName;
    }

    public void updateLastLogin() {
        this.lastLogin = LocalDateTime.now();
    }

    public boolean isAdmin() {
        return Role.ADMIN.equals(role);
    }

    // =========================
    // Spring Security methods
    // =========================
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(role.getValue()));
    }

    @Override
    public String getPassword() {
        return passwordHash;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return active;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return active;
    }
}
