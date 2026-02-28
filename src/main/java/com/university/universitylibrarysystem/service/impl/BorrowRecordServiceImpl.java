package com.university.universitylibrarysystem.service.impl;

import com.university.universitylibrarysystem.entity.Book;
import com.university.universitylibrarysystem.entity.BorrowRecord;
import com.university.universitylibrarysystem.entity.Student;
import com.university.universitylibrarysystem.repository.BookRepository;
import com.university.universitylibrarysystem.repository.BorrowRecordRepository;
import com.university.universitylibrarysystem.repository.StudentRepository;
import com.university.universitylibrarysystem.service.BorrowRecordService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class BorrowRecordServiceImpl implements BorrowRecordService {

    private final BorrowRecordRepository borrowRecordRepository;
    private final BookRepository bookRepository;
    private final StudentRepository studentRepository;

    @Autowired
    public BorrowRecordServiceImpl(BorrowRecordRepository borrowRecordRepository,
                                   BookRepository bookRepository,
                                   StudentRepository studentRepository) {
        this.borrowRecordRepository = borrowRecordRepository;
        this.bookRepository = bookRepository;
        this.studentRepository = studentRepository;
    }

    @Override
    public BorrowRecord borrowBook(Student student, Book book, int loanDays) {
        Student s = studentRepository.findById(student.getId())
                .orElseThrow(() -> new RuntimeException("Student not found"));
        Book b = bookRepository.findById(book.getId())
                .orElseThrow(() -> new RuntimeException("Book not found"));

        if (b.getAvailableCopies() <= 0) {
            throw new RuntimeException("No copies available for book: " + b.getId());
        }

        b.setAvailableCopies(b.getAvailableCopies() - 1);
        b.setTotalBorrows(b.getTotalBorrows() + 1);
        bookRepository.save(b);

        BorrowRecord record = new BorrowRecord();
        record.setBook(b);
        record.setStudent(s);
        LocalDateTime now = LocalDateTime.now();
        record.setBorrowDate(now);
        record.setDueDate(now.plusDays(Math.max(1, loanDays)));
        record.setFineAmount(0.0);

        return borrowRecordRepository.save(record);
    }

    @Override
    public BorrowRecord returnBook(Long borrowRecordId) {
        BorrowRecord record = borrowRecordRepository.findById(borrowRecordId)
                .orElseThrow(() -> new RuntimeException("BorrowRecord not found: " + borrowRecordId));

        if (record.getReturnDate() != null) {
            return record; // already returned
        }

        LocalDateTime now = LocalDateTime.now();
        record.setReturnDate(now);

        // Calculate fine if returned late
        if (now.isAfter(record.getDueDate())) {
            long daysLate = ChronoUnit.DAYS.between(record.getDueDate(), now);
            if (daysLate < 1) daysLate = 1;
            double fine = daysLate * 0.50;
            record.setFineAmount(fine);
            record.setStatus(BorrowRecord.BorrowStatus.OVERDUE);
        } else {
            record.setFineAmount(0.0);
            record.setStatus(BorrowRecord.BorrowStatus.RETURNED);
        }

        // Restore book availability
        Book b = record.getBook();
        b.setAvailableCopies(b.getAvailableCopies() + 1);
        bookRepository.save(b);

        return borrowRecordRepository.save(record);
    }

    @Override
    public BorrowRecord applyManualFine(Long borrowRecordId, double fineAmount, String reason) {
        BorrowRecord record = borrowRecordRepository.findById(borrowRecordId)
                .orElseThrow(() -> new RuntimeException("BorrowRecord not found: " + borrowRecordId));
        record.setFineAmount(fineAmount);
        if (reason != null && !reason.isBlank()) {
            record.setNotes(reason);
        }
        return borrowRecordRepository.save(record);
    }

    @Override
    public BorrowRecord markFinePaid(Long borrowRecordId) {
        BorrowRecord record = borrowRecordRepository.findById(borrowRecordId)
                .orElseThrow(() -> new RuntimeException("BorrowRecord not found: " + borrowRecordId));
        record.setFineAmount(0.0);
        record.setNotes(
            (record.getNotes() != null ? record.getNotes() + " | " : "") + "Fine paid"
        );
        return borrowRecordRepository.save(record);
    }

    @Override
    public List<BorrowRecord> findRecordsWithFines() {
        return borrowRecordRepository.findRecordsWithFines();
    }

    @Override
    public Optional<BorrowRecord> findActiveBorrowForBook(Book book) {
        return borrowRecordRepository.findByBookAndReturnDateIsNull(book);
    }

    @Override
    public List<BorrowRecord> findActiveBorrowsByStudent(Student student) {
        return borrowRecordRepository.findByStudentAndReturnDateIsNull(student);
    }

    @Override
    public Page<BorrowRecord> findByStudent(Student student, Pageable pageable) {
        return borrowRecordRepository.findByStudent(student, pageable);
    }

    @Override
    public Page<BorrowRecord> findOverdueBorrows(LocalDateTime currentDate, Pageable pageable) {
        return borrowRecordRepository.findOverdueBorrows(currentDate, pageable);
    }

    @Override
    public Optional<BorrowRecord> findById(Long id) {
        return borrowRecordRepository.findById(id);
    }
}