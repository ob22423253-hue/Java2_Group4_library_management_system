package com.university.universitylibrarysystem.repository;

import com.university.universitylibrarysystem.entity.BorrowRecord;
import com.university.universitylibrarysystem.entity.Book;
import com.university.universitylibrarysystem.entity.Student;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface for BorrowRecord entity operations.
 * Manages book borrowing and return transactions.
 */
@Repository
public interface BorrowRecordRepository extends JpaRepository<BorrowRecord, Long> {

    /**
     * Find active borrow record for a specific book.
     */
    Optional<BorrowRecord> findByBookAndReturnDateIsNull(Book book);

    /**
     * Find all active borrows for a student.
     */
    List<BorrowRecord> findByStudentAndReturnDateIsNull(Student student);

    /**
     * Find all borrows (active and returned) for a student.
     */
    Page<BorrowRecord> findByStudent(Student student, Pageable pageable);

    /**
     * Check if a book has any active borrows with a specific status.
     */
    boolean existsByBookAndStatus(Book book, BorrowRecord.BorrowStatus status);

    /**
     * Find all borrow records for a specific book regardless of status.
     */
    List<BorrowRecord> findByBook(Book book);

    /**
     * Find overdue borrows.
     */
    @Query("SELECT b FROM BorrowRecord b WHERE " +
           "b.dueDate < :currentDate AND b.returnDate IS NULL")
    Page<BorrowRecord> findOverdueBorrows(
        @Param("currentDate") LocalDateTime currentDate,
        Pageable pageable
    );

    /**
     * Get borrowing statistics for a date range.
     */
    @Query("SELECT DATE(b.borrowDate) as date, " +
           "COUNT(b.id) as borrows, " +
           "COUNT(b.returnDate) as returns " +
           "FROM BorrowRecord b " +
           "WHERE b.borrowDate BETWEEN :startDate AND :endDate " +
           "GROUP BY DATE(b.borrowDate)")
    List<Object[]> getBorrowStatistics(
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );

    /**
     * Find books borrowed more than specified number of times.
     */
    @Query("SELECT b.book, COUNT(b.id) as borrowCount " +
           "FROM BorrowRecord b " +
           "GROUP BY b.book " +
           "HAVING COUNT(b.id) >= :minBorrows")
    Page<Object[]> findPopularBooks(
        @Param("minBorrows") long minBorrows,
        Pageable pageable
    );

    /**
     * Calculate average borrowing duration for each book.
     */
    @Query("SELECT b.book, AVG(DATEDIFF(b.returnDate, b.borrowDate)) " +
           "FROM BorrowRecord b " +
           "WHERE b.returnDate IS NOT NULL " +
           "GROUP BY b.book")
    List<Object[]> calculateAverageBorrowDuration();

    /**
     * Find students with most borrows.
     */
    @Query("SELECT b.student, COUNT(b.id) as borrowCount " +
           "FROM BorrowRecord b " +
           "GROUP BY b.student " +
           "ORDER BY borrowCount DESC")
    Page<Object[]> findMostActiveReaders(Pageable pageable);
}