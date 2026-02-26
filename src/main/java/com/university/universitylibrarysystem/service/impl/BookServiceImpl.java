package com.university.universitylibrarysystem.service.impl;

import com.university.universitylibrarysystem.entity.Book;
import com.university.universitylibrarysystem.entity.BorrowRecord;
import com.university.universitylibrarysystem.dto.BookDTO;
import com.university.universitylibrarysystem.repository.BookRepository;
import com.university.universitylibrarysystem.repository.BorrowRecordRepository;
import com.university.universitylibrarysystem.service.BookService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;

@Service
@Transactional
public class BookServiceImpl implements BookService {

    private final BookRepository bookRepository;
    private final BorrowRecordRepository borrowRecordRepository;

    @Autowired
    public BookServiceImpl(BookRepository bookRepository,
                           BorrowRecordRepository borrowRecordRepository) {
        this.bookRepository = bookRepository;
        this.borrowRecordRepository = borrowRecordRepository;
    }

    @Override
    public Book createBook(BookDTO bookDTO) {
        Book book = mapToEntity(bookDTO);
        book.setAvailableCopies(book.getTotalCopies());
        return bookRepository.save(book);
    }

    @Override
    public Book updateBook(Long id, BookDTO bookDTO) {
        Book existingBook = bookRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Book not found with id: " + id));
        updateBookFromDTO(existingBook, bookDTO);
        return bookRepository.save(existingBook);
    }

    @Override
    public Optional<Book> findById(Long id) {
        return bookRepository.findById(id);
    }

    @Override
    public Optional<Book> findByRfidTag(String rfidTag) {
        return bookRepository.findByRfidTag(rfidTag);
    }

    @Override
    public Page<Book> searchBooks(String title, String author, String category,
                                  boolean available, Pageable pageable) {
        return bookRepository.searchBooks(title, author, category, available, pageable);
    }

    @Override
    @Transactional
    public void markAsBorrowed(Long id, int copies) {
        Book book = bookRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Book not found with id: " + id));
        if (book.getAvailableCopies() < copies) {
            throw new RuntimeException("Not enough copies available");
        }
        book.setAvailableCopies(book.getAvailableCopies() - copies);
        book.setTotalBorrows(book.getTotalBorrows() + copies);
        bookRepository.save(book);
    }

    @Override
    @Transactional
    public void markAsReturned(Long id, int copies, int condition) {
        Book book = bookRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Book not found with id: " + id));
        book.setAvailableCopies(book.getAvailableCopies() + copies);
        bookRepository.save(book);
    }

    @Override
    public Page<Book> getBooksNeedingMaintenance(int conditionThreshold,
                                                 int borrowThreshold,
                                                 Pageable pageable) {
        return bookRepository.findBooksNeedingMaintenance(conditionThreshold, borrowThreshold, pageable);
    }

    @Override
    public Page<Book> getBooksNeedingRestock(int threshold, Pageable pageable) {
        return bookRepository.findBooksNeedingRestock(threshold, pageable);
    }

    @Override
    @Transactional
    public void deleteBook(Long id) {
        Book book = bookRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Book not found with id: " + id));
        boolean hasActiveBorrows = borrowRecordRepository
            .existsByBookAndStatus(book, BorrowRecord.BorrowStatus.BORROWED);
        if (hasActiveBorrows) {
            throw new RuntimeException("Cannot delete book while it is currently borrowed by a student");
        }
        bookRepository.delete(book);
    }

    @Override
    public Page<Book> getPopularBooks(int minBorrows, Pageable pageable) {
        return bookRepository.findPopularBooks(minBorrows, pageable);
    }

    @Override
    @Transactional
    public Book updateBookCondition(Long id, int newCondition, String notes) {
        Book book = bookRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Book not found with id: " + id));
        book.setNotes(notes);
        return bookRepository.save(book);
    }

    private Book mapToEntity(BookDTO dto) {
        Book book = new Book();
        updateBookFromDTO(book, dto);
        return book;
    }

    private void updateBookFromDTO(Book book, BookDTO dto) {
        book.setTitle(dto.getTitle());
        book.setAuthor(dto.getAuthor());
        book.setIsbn(dto.getIsbn());
        book.setCategory(dto.getCategory());
        book.setPublicationYear(dto.getPublicationYear());
        book.setPublisher(dto.getPublisher());
        book.setLocationCode(dto.getLocationCode());
        book.setRfidTag(dto.getRfidTag());
        book.setDescription(dto.getDescription());
        book.setCoverImageUrl(dto.getCoverImageUrl());
        book.setNotes(dto.getNotes());

        if (dto.getTotalCopies() != null) {
            int oldTotal = book.getTotalCopies();
            int newTotal = dto.getTotalCopies();
            int oldAvailable = book.getAvailableCopies();
            int borrowed = Math.max(0, oldTotal - oldAvailable);
            int newAvailable = Math.max(0, newTotal - borrowed);
            book.setTotalCopies(newTotal);
            book.setAvailableCopies(newAvailable);
        }
    }
} 