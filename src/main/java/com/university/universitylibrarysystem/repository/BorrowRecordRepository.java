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
     * 
     * @param book The book to check
     * @return Optional of active borrow record if exists
     */
    Optional<BorrowRecord> findByBookAndReturnDateIsNull(Book book);

    /**
     * Find all active borrows for a student.
     * 
     * @param student The student whose borrows to find
     * @return List of active borrow records
     */
    List<BorrowRecord> findByStudentAndReturnDateIsNull(Student student);

    /**
     * Find all borrows (active and returned) for a student.
     * Results are pageable for large datasets.
     * 
     * @param student The student whose history to find
     * @param pageable Pagination information
     * @return Page of borrow records
     */
    Page<BorrowRecord> findByStudent(Student student, Pageable pageable);

    /**
     * Find overdue borrows.
     * 
     * @param currentDate The date to check against
     * @param pageable Pagination information
     * @return Page of overdue borrow records
     */
    @Query("SELECT b FROM BorrowRecord b WHERE " +
           "b.dueDate < :currentDate AND b.returnDate IS NULL")
    Page<BorrowRecord> findOverdueBorrows(
        @Param("currentDate") LocalDateTime currentDate,
        Pageable pageable
    );

    /**
     * Get borrowing statistics for a date range.
     * Returns array of [date, borrow count, return count]
     * 
     * @param startDate Start of date range
     * @param endDate End of date range
     * @return List of daily statistics
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
     * 
     * @param minBorrows Minimum number of borrows
     * @param pageable Pagination information
     * @return Page of borrow records
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
     * Only considers returned books.
     * 
     * @return List of [book, average duration in days]
     */
    @Query("SELECT b.book, AVG(DATEDIFF(b.returnDate, b.borrowDate)) " +
           "FROM BorrowRecord b " +
           "WHERE b.returnDate IS NOT NULL " +
           "GROUP BY b.book")
    List<Object[]> calculateAverageBorrowDuration();

    /**
     * Find students with most borrows.
     * 
     * @param pageable Pagination information
     * @return Page of [student, borrow count]
     */
    @Query("SELECT b.student, COUNT(b.id) as borrowCount " +
           "FROM BorrowRecord b " +
           "GROUP BY b.student " +
           "ORDER BY borrowCount DESC")
    Page<Object[]> findMostActiveReaders(Pageable pageable);
}