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

@Repository
public interface BorrowRecordRepository extends JpaRepository<BorrowRecord, Long> {

    Optional<BorrowRecord> findByBookAndReturnDateIsNull(Book book);

    List<BorrowRecord> findByStudentAndReturnDateIsNull(Student student);

    Page<BorrowRecord> findByStudent(Student student, Pageable pageable);

    boolean existsByBookAndStatus(Book book, BorrowRecord.BorrowStatus status);

    List<BorrowRecord> findByBook(Book book);

    @Query("SELECT b FROM BorrowRecord b WHERE b.dueDate < :currentDate AND b.returnDate IS NULL")
    Page<BorrowRecord> findOverdueBorrows(
        @Param("currentDate") LocalDateTime currentDate,
        Pageable pageable
    );

    @Query("SELECT DATE(b.borrowDate) as date, COUNT(b.id) as borrows, COUNT(b.returnDate) as returns " +
           "FROM BorrowRecord b WHERE b.borrowDate BETWEEN :startDate AND :endDate " +
           "GROUP BY DATE(b.borrowDate)")
    List<Object[]> getBorrowStatistics(
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );

    @Query("SELECT b.book, COUNT(b.id) as borrowCount FROM BorrowRecord b " +
           "GROUP BY b.book HAVING COUNT(b.id) >= :minBorrows")
    Page<Object[]> findPopularBooks(
        @Param("minBorrows") long minBorrows,
        Pageable pageable
    );

    @Query("SELECT b.book, AVG(DATEDIFF(b.returnDate, b.borrowDate)) " +
           "FROM BorrowRecord b WHERE b.returnDate IS NOT NULL GROUP BY b.book")
    List<Object[]> calculateAverageBorrowDuration();

    @Query("SELECT b.student, COUNT(b.id) as borrowCount FROM BorrowRecord b " +
           "GROUP BY b.student ORDER BY borrowCount DESC")
    Page<Object[]> findMostActiveReaders(Pageable pageable);

    // Records that have a fine greater than zero
    @Query("SELECT b FROM BorrowRecord b WHERE b.fineAmount > 0 ORDER BY b.dueDate ASC")
    List<BorrowRecord> findRecordsWithFines();
}