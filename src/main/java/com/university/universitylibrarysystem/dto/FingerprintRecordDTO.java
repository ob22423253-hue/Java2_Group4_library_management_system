package com.university.universitylibrarysystem.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * DTO for FingerprintRecord entity.
 * Holds metadata, not actual fingerprint data.
 */
@Data
public class FingerprintRecordDTO {

    private Long id;

    @NotNull(message = "Student ID is required")
    private Long studentId;

    @NotBlank(message = "Fingerprint hash is required")
    @Size(max = 512)
    private String fingerprintHash;

    private LocalDateTime registeredAt;

    private String deviceId;
}
