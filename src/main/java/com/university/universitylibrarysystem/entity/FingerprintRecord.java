package com.university.universitylibrarysystem.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "fingerprint_records")
@Getter @Setter @NoArgsConstructor
public class FingerprintRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false, unique = true)
    @NotNull(message = "Student is required")
    private Student student;

    @Column(name = "template_data", nullable = false)
    @NotNull(message = "Template data is required")
    private byte[] templateData;

    @Column(name = "template_hash", nullable = false)
    @NotNull(message = "Template hash is required")
    private String templateHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FingerPosition fingerPosition;

    @Column(name = "quality_score")
    @Min(0)
    @Max(100)
    private Integer qualityScore;

    @Column(name = "is_verified")
    private boolean isVerified;

    /** NEW FIELD (needed by repository) */
    @Column(name = "last_verified_at")
    private LocalDateTime lastVerifiedAt;

    @Column(name = "consent_date", nullable = false)
    @NotNull(message = "Consent date is required")
    private LocalDateTime consentDate;

    /** Maps to repository expiryDate */
    @Column(name = "retention_end_date")
    private LocalDateTime retentionEndDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "enrolled_by")
    private Librarian enrolledBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /** NEW FIELD (repository expects lastUpdatedAt) */
    @Transient
    private LocalDateTime lastUpdatedAt;

    public enum FingerPosition {
        RIGHT_THUMB,
        RIGHT_INDEX,
        RIGHT_MIDDLE,
        RIGHT_RING,
        RIGHT_LITTLE,
        LEFT_THUMB,
        LEFT_INDEX,
        LEFT_MIDDLE,
        LEFT_RING,
        LEFT_LITTLE
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        retentionEndDate = createdAt.plusYears(4);
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        lastUpdatedAt = updatedAt;
    }

    public boolean isExpired() {
        return retentionEndDate != null &&
               LocalDateTime.now().isAfter(retentionEndDate);
    }

    public boolean meetsQualityStandards() {
        return qualityScore != null && qualityScore >= 60;
    }

    public boolean validateTemplateIntegrity(String computedHash) {
        return templateHash != null &&
               templateHash.equals(computedHash);
    }
}
