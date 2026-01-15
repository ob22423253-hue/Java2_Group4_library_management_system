package com.university.universitylibrarysystem.controller;

import com.university.universitylibrarysystem.dto.BookDTO;
import com.university.universitylibrarysystem.entity.Book;
import com.university.universitylibrarysystem.service.BookService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

/**
 * REST Controller for managing books in the library system.
 * 
 * Provides endpoints for CRUD operations, searching, and maintenance-related actions.
 */
@RestController
@RequestMapping("/books")
public class BookController {

    private final BookService bookService;

    // ✅ Constructor-based dependency injection
    @Autowired
    public BookController(BookService bookService) {
        this.bookService = bookService;
    }

    // ========================= CREATE =========================

    /**
     * Create a new book record.
     * 
     * @param bookDTO The book data to create
     * @return ResponseEntity with created book and status 201 (Created)
     */
    @PostMapping
    public ResponseEntity<Book> createBook(@Validated @RequestBody BookDTO bookDTO) {
        Book createdBook = bookService.createBook(bookDTO);
        return new ResponseEntity<>(createdBook, HttpStatus.CREATED);
    }

    // ========================= READ =========================

    /**
     * Get all books with optional filters (title, author, category, availability).
     * Supports pagination.
     * 
     * Example: GET /api/books?title=Java&author=Smith&page=0&size=10
     */
    @GetMapping
    public ResponseEntity<Page<Book>> getBooks(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String author,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "false") boolean available,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<Book> books = bookService.searchBooks(title, author, category, available, pageable);
        return ResponseEntity.ok(books);
    }

    /**
     * Get a single book by its ID.
     * 
     * @param id Book ID
     * @return Book if found, otherwise 404 Not Found
     */
    @GetMapping("/{id}")
    public ResponseEntity<Book> getBookById(@PathVariable Long id) {
        Optional<Book> book = bookService.findById(id);
        return book.map(ResponseEntity::ok)
                   .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get a single book by its RFID tag.
     * 
     * @param rfidTag The RFID tag of the book
     * @return Book if found, otherwise 404 Not Found
     */
    @GetMapping("/rfid/{rfidTag}")
    public ResponseEntity<Book> getBookByRfidTag(@PathVariable String rfidTag) {
        Optional<Book> book = bookService.findByRfidTag(rfidTag);
        return book.map(ResponseEntity::ok)
                   .orElse(ResponseEntity.notFound().build());
    }

    // ========================= UPDATE =========================

    /**
     * Update book details by ID.
     * 
     * @param id Book ID
     * @param bookDTO Updated book information
     * @return Updated Book entity
     */
    @PutMapping("/{id}")
    public ResponseEntity<Book> updateBook(@PathVariable Long id,
                                           @Validated @RequestBody BookDTO bookDTO) {
        Book updatedBook = bookService.updateBook(id, bookDTO);
        return ResponseEntity.ok(updatedBook);
    }

    /**
     * Update the condition and notes of a book (e.g. after maintenance check).
     * 
     * @param id Book ID
     * @param newCondition New condition value (1–10)
     * @param notes Optional maintenance notes
     * @return Updated Book entity
     */
    @PatchMapping("/{id}/condition")
    public ResponseEntity<Book> updateBookCondition(
            @PathVariable Long id,
            @RequestParam int newCondition,
            @RequestParam(required = false) String notes) {

        Book updatedBook = bookService.updateBookCondition(id, newCondition, notes);
        return ResponseEntity.ok(updatedBook);
    }

    // ========================= DELETE =========================

    /**
     * Delete a book from the system.
     * 
     * @param id Book ID
     * @return 204 No Content if deleted successfully
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBook(@PathVariable Long id) {
        bookService.deleteBook(id);
        return ResponseEntity.noContent().build();
    }

    // ========================= BORROW / RETURN =========================

    /**
     * Mark a book as borrowed.
     * 
     * @param id Book ID
     * @param copies Number of copies borrowed
     * @return 200 OK when successful
     */
    @PostMapping("/{id}/borrow")
    public ResponseEntity<Void> borrowBook(@PathVariable Long id,
                                           @RequestParam(defaultValue = "1") int copies) {
        bookService.markAsBorrowed(id, copies);
        return ResponseEntity.ok().build();
    }

    /**
     * Mark a book as returned.
     * 
     * @param id Book ID
     * @param copies Number of copies returned
     * @param condition Updated condition rating (1–10)
     * @return 200 OK when successful
     */
    @PostMapping("/{id}/return")
    public ResponseEntity<Void> returnBook(@PathVariable Long id,
                                           @RequestParam(defaultValue = "1") int copies,
                                           @RequestParam(defaultValue = "10") int condition) {
        bookService.markAsReturned(id, copies, condition);
        return ResponseEntity.ok().build();
    }

    // ========================= MAINTENANCE / REPORTS =========================

    /**
     * Get books needing maintenance or replacement.
     * 
     * @param conditionThreshold Minimum acceptable condition
     * @param borrowThreshold Borrow count threshold
     * @param page Page number
     * @param size Page size
     * @return Page of books requiring maintenance
     */
    @GetMapping("/maintenance")
    public ResponseEntity<Page<Book>> getBooksNeedingMaintenance(
            @RequestParam(defaultValue = "3") int conditionThreshold,
            @RequestParam(defaultValue = "50") int borrowThreshold,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<Book> books = bookService.getBooksNeedingMaintenance(conditionThreshold, borrowThreshold, pageable);
        return ResponseEntity.ok(books);
    }

    /**
     * Get books that need restocking (low available copies).
     * 
     * @param threshold Minimum number of available copies
     * @param page Page number
     * @param size Page size
     * @return Page of books needing restock
     */
    @GetMapping("/restock")
    public ResponseEntity<Page<Book>> getBooksNeedingRestock(
            @RequestParam(defaultValue = "2") int threshold,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<Book> books = bookService.getBooksNeedingRestock(threshold, pageable);
        return ResponseEntity.ok(books);
    }

    /**
     * Get popular books based on borrow history.
     * 
     * @param minBorrows Minimum number of borrows
     * @param page Page number
     * @param size Page size
     * @return Page of popular books
     */
    @GetMapping("/popular")
    public ResponseEntity<Page<Book>> getPopularBooks(
            @RequestParam(defaultValue = "20") int minBorrows,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<Book> books = bookService.getPopularBooks(minBorrows, pageable);
        return ResponseEntity.ok(books);
    }
}

