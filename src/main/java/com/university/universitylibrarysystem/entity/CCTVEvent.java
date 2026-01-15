package com.university.universitylibrarysystem.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * Entity representing a CCTV camera event/capture.
 * 
 * This entity stores metadata about security camera events:
 * - Person detection events
 * - Face recognition matches
 * - Links to stored footage/images
 * - Associated library entries/incidents
 * 
 * SECURITY NOTE: Actual images/video should be stored in secure storage,
 * this entity only maintains metadata and secure references.
 * 
 * @author University Library System
 * @version 1.0
 */
@Entity
@Table(name = "cctv_events")
@Getter @Setter @NoArgsConstructor
public class CCTVEvent {

    /**
     * Unique identifier for the CCTV event.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * When the event occurred.
     */
    @Column(name = "event_time", nullable = false)
    @NotNull(message = "Event time is required")
    private LocalDateTime eventTime;

    /**
     * Type of event detected.
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EventType eventType;

    /**
     * Which camera captured this event.
     */
    @Column(name = "camera_id", nullable = false)
    @NotNull(message = "Camera ID is required")
    private String cameraId;

    /**
     * Location of the camera in the library.
     */
    @Column(nullable = false)
    @NotNull(message = "Location is required")
    private String location;

    /**
     * Secure URL or reference to the captured image/video.
     */
    @Column(name = "capture_ref", nullable = false)
    @NotNull(message = "Capture reference is required")
    private String captureRef;

    /**
     * Associated library entry if this was an entry/exit event.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "library_entry_id")
    private LibraryEntry libraryEntry;

    /**
     * Student identified in the footage, if any.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id")
    private Student student;

    /**
     * Confidence score of face recognition (0-100).
     */
    @Column(name = "recognition_confidence")
    @Min(value = 0, message = "Confidence must be between 0 and 100")
    @Max(value = 100, message = "Confidence must be between 0 and 100")
    private Integer recognitionConfidence;

    /**
     * Any security flags raised for this event.
     */
    @Column(name = "security_flags", length = 200)
    private String securityFlags;

    /**
     * Whether this event requires staff review.
     */
    @Column(name = "needs_review")
    private boolean needsReview;

    /**
     * Staff member who reviewed this event, if any.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by")
    private Librarian reviewedBy;

    /**
     * When the event was reviewed.
     */
    @Column(name = "review_time")
    private LocalDateTime reviewTime;

    /**
     * Description of the event.
     */
    @Column(length = 500)
    private String description;

    /**
     * Notes from the review.
     */
    @Column(length = 500)
    private String reviewNotes;

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
     * Types of events that can be detected.
     */
    public enum EventType {
        PERSON_DETECTED,
        FACE_RECOGNIZED,
        ENTRY_EXIT,
        SUSPICIOUS_ACTIVITY,
        EMERGENCY_EXIT_USED,
        RESTRICTED_AREA_ACCESS
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
     * Records that this event has been reviewed.
     * 
     * @param reviewer Staff member performing the review
     * @param notes Any notes from the review
     */
    public void markAsReviewed(Librarian reviewer, String notes) {
        this.reviewedBy = reviewer;
        this.reviewTime = LocalDateTime.now();
        this.reviewNotes = notes;
        this.needsReview = false;
    }

    /**
     * Flags this event for staff review.
     * 
     * @param reason Why this event needs review
     */
    public void flagForReview(String reason) {
        this.needsReview = true;
        this.securityFlags = reason;
    }

    /**
     * Checks if the face recognition confidence meets the threshold.
     * 
     * @param minimumConfidence Minimum required confidence (0-100)
     * @return true if confidence meets or exceeds minimum
     */
    public boolean meetsConfidenceThreshold(int minimumConfidence) {
        return recognitionConfidence != null && 
               recognitionConfidence >= minimumConfidence;
    }
}