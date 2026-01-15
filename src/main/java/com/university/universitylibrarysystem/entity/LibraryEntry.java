package com.university.universitylibrarysystem.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * Entity representing a library entry/exit event.
 * 
 * This entity tracks:
 * - When students enter/exit the library
 * - Which authentication method was used (RFID, fingerprint, manual)
 * - Links to any CCTV captures
 * - Duration of stay (via entry and exit times)
 * 
 * @author University Library System
 * @version 1.0
 */
@Entity
@Table(name = "library_entries")
@Getter @Setter @NoArgsConstructor
public class LibraryEntry {

    /**
     * Unique identifier for the entry record.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * The student who entered/exited.
     * Many entries can belong to one student.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    @NotNull(message = "Student is required")
    private Student student;

    /**
     * When the student entered the library.
     */
    @Column(name = "entry_time", nullable = false)
    @NotNull(message = "Entry time is required")
    private LocalDateTime entryTime;

    /**
     * When the student exited the library.
     * Null if student hasn't exited yet.
     */
    @Column(name = "exit_time")
    private LocalDateTime exitTime;

    /**
     * How the student was authenticated on entry.
     * E.g., RFID_CARD, FINGERPRINT, MANUAL_CHECK
     */
    @Column(name = "entry_method", nullable = false, length = 20)
    @NotNull(message = "Entry method is required")
    @Enumerated(EnumType.STRING)
    private EntryMethod entryMethod;

    /**
     * URL or reference to CCTV capture on entry.
     */
    @Column(name = "entry_capture_ref")
    private String entryCaptureRef;

    /**
     * URL or reference to CCTV capture on exit.
     */
    @Column(name = "exit_capture_ref")
    private String exitCaptureRef;

    /**
     * Staff member who manually verified entry, if applicable.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "verified_by")
    private Librarian verifiedBy;

    /**
     * Any notes about the entry/exit.
     */
    @Column(length = 500)
    private String notes;

    /**
     * When this record was created.
     */
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * When this record was last updated.
     */
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /**
     * Valid authentication methods for library entry.
     */
    public enum EntryMethod {
        RFID_CARD,
        QR,
        FINGERPRINT,
        MANUAL_CHECK
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    /**
     * Records the exit time of the student.
     * Also calculates and returns the duration of stay.
     * 
     * @return Duration of stay in minutes
     */
    public long recordExit() {
        this.exitTime = LocalDateTime.now();
        return getDurationInMinutes();
    }

    /**
     * Calculates how long the student stayed in the library.
     * 
     * @return Duration in minutes, or -1 if still in library
     */
    public long getDurationInMinutes() {
        if (exitTime == null) {
            return -1; // Still in library
        }
        return java.time.Duration.between(entryTime, exitTime).toMinutes();
    }

    /**
     * Checks if the student is currently in the library.
     */
    public boolean isInLibrary() {
        return exitTime == null;
    }
}