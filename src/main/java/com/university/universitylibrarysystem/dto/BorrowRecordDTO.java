package com.university.universitylibrarysystem.dto;

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

    @NotNull(message = "Borrow date is required")
    private LocalDate borrowDate;

    private LocalDate returnDate;

    @NotNull(message = "Due date is required")
    private LocalDate dueDate;

    @Pattern(regexp = "^(BORROWED|RETURNED|OVERDUE)$", 
             message = "Status must be BORROWED, RETURNED, or OVERDUE")
    private String status;

    private String remarks;
}
