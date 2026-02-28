package com.university.universitylibrarysystem.dto;

import lombok.Data;
import lombok.AllArgsConstructor;

@Data
@AllArgsConstructor
public class LibraryStatusDTO {
    private boolean open;
    private String message;
    private String openTime;
    private String closeTime;
    private String workingDays;
}