package com.university.universitylibrarysystem.dto;

import lombok.Data;
import java.time.LocalTime;
import java.time.LocalDateTime;

@Data
public class LibraryHoursDTO {
    private Long id;
    private LocalTime openTime;
    private LocalTime closeTime;
    private String workingDays;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}