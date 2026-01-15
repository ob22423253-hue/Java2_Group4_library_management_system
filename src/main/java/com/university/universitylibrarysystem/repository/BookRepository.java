package com.university.universitylibrarysystem.repository;

import com.university.universitylibrarysystem.entity.Book;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

/**
 * Repository interface for Book entity operations.
 * Handles book inventory and search functionality.
 */
@Repository
public interface BookRepository extends JpaRepository<Book, Long> {

    /**
     * Find book by its RFID tag.
     * 
     * @param rfidTag The RFID tag to search for
     * @return Optional of matching book
     */
    Optional<Book> findByRfidTag(String rfidTag);

    /**
     * Find book by ISBN.
     * 
     * @param isbn ISBN to search for
     * @return Optional of matching book
     */
    Optional<Book> findByIsbn(String isbn);

    /**
     * Search books by title (case-insensitive, partial match).
     * 
     * @param title Title to search for
     * @param pageable Pagination information
     * @return Page of matching books
     */
    Page<Book> findByTitleContainingIgnoreCase(String title, Pageable pageable);

    /**
     * Search books by author (case-insensitive, partial match).
     * 
     * @param author Author to search for
     * @param pageable Pagination information
     * @return Page of matching books
     */
    Page<Book> findByAuthorContainingIgnoreCase(String author, Pageable pageable);

    /**
     * Find books by subject category.
     * 
     * @param category Category to search for
     * @param pageable Pagination information
     * @return Page of matching books
     */
    Page<Book> findByCategory(String category, Pageable pageable);

    /**
     * Find books published in a specific year.
     * 
     * @param year Publication year
     * @param pageable Pagination information
     * @return Page of matching books
     */
    Page<Book> findByPublicationYear(int year, Pageable pageable);

    /**
     * Find available books (copies available for borrowing).
     * 
     * @param pageable Pagination information
     * @return Page of available books
     */
    @Query("SELECT b FROM Book b WHERE b.availableCopies > 0")
    Page<Book> findAvailableBooks(Pageable pageable);

    /**
     * Search books by multiple criteria.
     * 
     * @param title Optional title search term
     * @param author Optional author search term
     * @param category Optional category
     * @param available Whether to only include books with available copies
     * @param pageable Pagination information
     * @return Page of matching books
     */
    @Query("SELECT DISTINCT b FROM Book b " +
           "WHERE (:title IS NULL OR LOWER(b.title) LIKE LOWER(CONCAT('%', :title, '%'))) " +
           "AND (:author IS NULL OR LOWER(b.author) LIKE LOWER(CONCAT('%', :author, '%'))) " +
           "AND (:category IS NULL OR b.category = :category) " +
           "AND (:available = false OR b.availableCopies > 0)")
    Page<Book> searchBooks(
        @Param("title") String title,
        @Param("author") String author,
        @Param("category") String category,
        @Param("available") boolean available,
        Pageable pageable
    );

    /**
     * Get books that need maintenance or replacement.
     * Based on condition rating and borrow history.
     * 
     * @param conditionThreshold Minimum acceptable condition rating
     * @param borrowThreshold Number of times borrowed to consider for maintenance
     * @param pageable Pagination information
     * @return Page of books needing attention
     */
    @Query("SELECT b FROM Book b WHERE " +
           "b.totalBorrows >= :borrowThreshold")
    Page<Book> findBooksNeedingMaintenance(
        @Param("conditionThreshold") int conditionThreshold,
        @Param("borrowThreshold") int borrowThreshold,
        Pageable pageable
    );

    /**
     * Find books that need restocking (available copies below threshold).
     * 
     * @param threshold Minimum number of available copies
     * @param pageable Pagination information
     * @return Page of books needing restock
     */
    @Query("SELECT b FROM Book b WHERE b.availableCopies < :threshold")
    Page<Book> findBooksNeedingRestock(
        @Param("threshold") int threshold,
        Pageable pageable
    );

    /**
     * Get popular books based on borrow history.
     * 
     * @param minBorrows Minimum number of times borrowed
     * @param pageable Pagination information
     * @return Page of popular books
     */
    @Query("SELECT b FROM Book b WHERE b.totalBorrows >= :minBorrows " +
           "ORDER BY b.totalBorrows DESC")
    Page<Book> findPopularBooks(
        @Param("minBorrows") int minBorrows,
        Pageable pageable
    );

    /**
     * Get books with low utilization.
     * 
     * @param maxBorrows Maximum number of times borrowed
     * @param pageable Pagination information
     * @return Page of less borrowed books
     */
    @Query("SELECT b FROM Book b WHERE b.totalBorrows <= :maxBorrows " +
           "ORDER BY b.totalBorrows ASC")
    Page<Book> findLowUtilizationBooks(
        @Param("maxBorrows") int maxBorrows,
        Pageable pageable
    );
}