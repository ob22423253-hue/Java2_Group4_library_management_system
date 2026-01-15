package com.university.universitylibrarysystem.service;

import com.university.universitylibrarysystem.entity.Book;
import com.university.universitylibrarysystem.dto.BookDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Optional;

/**
 * Service interface for managing Book entities.
 * Provides high-level business operations for book management.
 */
public interface BookService {

    /**
     * Create a new book in the system.
     *
     * @param bookDTO Data transfer object containing book information
     * @return Created book entity
     */
    Book createBook(BookDTO bookDTO);

    /**
     * Update an existing book's information.
     *
     * @param id Book ID to update
     * @param bookDTO Updated book information
     * @return Updated book entity
     * @throws RuntimeException if book not found
     */
    Book updateBook(Long id, BookDTO bookDTO);

    /**
     * Find a book by its ID.
     *
     * @param id Book ID to find
     * @return Optional containing the book if found
     */
    Optional<Book> findById(Long id);

    /**
     * Find a book by its RFID tag.
     *
     * @param rfidTag RFID tag to search for
     * @return Optional containing the book if found
     */
    Optional<Book> findByRfidTag(String rfidTag);

    /**
     * Search books with various criteria.
     *
     * @param title Optional title search term
     * @param author Optional author search term
     * @param category Optional category
     * @param available Whether to only show available books
     * @param pageable Pagination information
     * @return Page of matching books
     */
    Page<Book> searchBooks(String title, String author, String category, 
                          boolean available, Pageable pageable);

    /**
     * Mark a book as borrowed.
     *
     * @param id Book ID
     * @param copies Number of copies borrowed
     * @throws RuntimeException if not enough copies available
     */
    void markAsBorrowed(Long id, int copies);

    /**
     * Mark a book as returned.
     *
     * @param id Book ID
     * @param copies Number of copies returned
     * @param condition New condition rating of the returned book
     */
    void markAsReturned(Long id, int copies, int condition);

    /**
     * Get books that need maintenance.
     *
     * @param conditionThreshold Minimum acceptable condition
     * @param borrowThreshold Borrow count threshold
     * @param pageable Pagination information
     * @return Page of books needing maintenance
     */
    Page<Book> getBooksNeedingMaintenance(int conditionThreshold, 
                                         int borrowThreshold, 
                                         Pageable pageable);

    /**
     * Get books that need restocking.
     *
     * @param threshold Minimum copies threshold
     * @param pageable Pagination information
     * @return Page of books needing restock
     */
    Page<Book> getBooksNeedingRestock(int threshold, Pageable pageable);

    /**
     * Delete a book from the system.
     *
     * @param id Book ID to delete
     * @throws RuntimeException if book has active borrows
     */
    void deleteBook(Long id);

    /**
     * Get popular books based on borrow history.
     *
     * @param minBorrows Minimum number of borrows
     * @param pageable Pagination information
     * @return Page of popular books
     */
    Page<Book> getPopularBooks(int minBorrows, Pageable pageable);

    /**
     * Update book condition after inspection.
     *
     * @param id Book ID
     * @param newCondition New condition rating
     * @param notes Optional maintenance notes
     * @return Updated book entity
     */
    Book updateBookCondition(Long id, int newCondition, String notes);
}