package com.university.universitylibrarysystem.service;

import com.university.universitylibrarysystem.entity.Book;
import com.university.universitylibrarysystem.entity.BorrowRecord;
import com.university.universitylibrarysystem.entity.Student;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface BorrowRecordService {

    BorrowRecord borrowBook(Student student, Book book, int loanDays);

    BorrowRecord returnBook(Long borrowRecordId);

    BorrowRecord applyManualFine(Long borrowRecordId, double fineAmount, String reason);

    BorrowRecord markFinePaid(Long borrowRecordId);

    List<BorrowRecord> findRecordsWithFines();

    Optional<BorrowRecord> findActiveBorrowForBook(Book book);

    List<BorrowRecord> findActiveBorrowsByStudent(Student student);

    Page<BorrowRecord> findByStudent(Student student, Pageable pageable);

    Page<BorrowRecord> findOverdueBorrows(LocalDateTime currentDate, Pageable pageable);

    Optional<BorrowRecord> findById(Long id);
}