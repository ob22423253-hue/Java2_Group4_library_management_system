package com.university.universitylibrarysystem.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class ScanRequestDTO {
    // optional: client does not send studentId; server extracts it from token
    private String scanType; // ENTRY or EXIT (optional, default ENTRY)
    private LocalDateTime scanTime; // optional
    private String qrValue; // value scanned from QR code (e.g., "LIBRARY_ENTRY" / "LIBRARY_EXIT")
}
