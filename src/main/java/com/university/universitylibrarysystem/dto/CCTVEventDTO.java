package com.university.universitylibrarysystem.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CCTVEventDTO {
    private Long id;

    @NotNull(message = "Event type is required")
    private String eventType;

    @NotNull(message = "Camera location is required")
    private String cameraLocation;

    @Size(max = 1000)
    private String description;

    private String captureRef;
    private boolean needsReview;
    private String reviewNotes;
    private Long libraryEntryId;
    private LocalDateTime timestamp;
}