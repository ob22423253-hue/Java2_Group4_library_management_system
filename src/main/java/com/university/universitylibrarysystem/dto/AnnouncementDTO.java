package com.university.universitylibrarysystem.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AnnouncementDTO {
    private Long id;
    private String title;
    private String content;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
}