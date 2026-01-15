package com.university.universitylibrarysystem.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Entity
@Table(name = "borrow_records")
@Getter
@Setter
@NoArgsConstructor
public class BorrowRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(name = "borrow_date", nullable = false)
    @NotNull(message = "Borrow date is required")
    private LocalDateTime borrowDate;

    @Column(name = "due_date", nullable = false)
    @NotNull(message = "Due date is required")
    private LocalDateTime dueDate;

    @Column(name = "return_date")
    private LocalDateTime returnDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private BorrowStatus status;

    // renamed to match repository query
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "processed_by")
    private Librarian processedBy; // previously issuedBy

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "return_processed_by")
    private Librarian returnProcessedBy; // previously returnedTo

    @Column(name = "fine_amount")
    private Double fineAmount = 0.0;

    @Column(length = 500)
    private String notes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum BorrowStatus {
        BORROWED,
        OVERDUE,
        RETURNED,
        LOST,
        DAMAGED
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) {
            status = BorrowStatus.BORROWED;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public double recordReturn(Librarian returnProcessedBy, String condition) {
        this.returnDate = LocalDateTime.now();
        this.returnProcessedBy = returnProcessedBy;
        this.notes = condition;

        if (returnDate.isAfter(dueDate)) {
            long daysLate = ChronoUnit.DAYS.between(dueDate, returnDate);
            this.fineAmount = calculateFine(daysLate);
            this.status = BorrowStatus.OVERDUE;
        } else {
            this.status = BorrowStatus.RETURNED;
        }

        return this.fineAmount;
    }

    private double calculateFine(long daysLate) {
        return daysLate * 0.50;
    }

    public boolean isOverdue() {
        return returnDate == null && LocalDateTime.now().isAfter(dueDate);
    }

    public long getDaysUntilDue() {
        return ChronoUnit.DAYS.between(LocalDateTime.now(), dueDate);
    }
}
