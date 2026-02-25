package com.university.universitylibrarysystem.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDate;

/**
 * DTO for BorrowRecord entity.
 * Tracks borrowing and returning events.
 */
@Data
public class BorrowRecordDTO {

    private Long id;

    @NotNull(message = "Student ID is required")
    private Long studentId;

    @NotNull(message = "Book ID is required")
    private Long bookId;

    
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate borrowDate;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate returnDate;

    @NotNull(message = "Due date is required")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dueDate;

    @Pattern(regexp = "^(BORROWED|RETURNED|OVERDUE)$", 
             message = "Status must be BORROWED, RETURNED, or OVERDUE")
    private String status;

    private String remarks;
}