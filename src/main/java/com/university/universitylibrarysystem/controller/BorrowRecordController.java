package com.university.universitylibrarysystem.controller;

import com.university.universitylibrarysystem.dto.BorrowRecordDTO;
import com.university.universitylibrarysystem.entity.Book;
import com.university.universitylibrarysystem.entity.BorrowRecord;
import com.university.universitylibrarysystem.entity.Student;
import com.university.universitylibrarysystem.service.BookService;
import com.university.universitylibrarysystem.service.BorrowRecordService;
import com.university.universitylibrarysystem.service.StudentService;
import com.university.universitylibrarysystem.util.ResponseHandler;
import com.university.universitylibrarysystem.mapper.StudentMapper;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for managing borrow and return transactions.
 */
@RestController
@RequestMapping("/borrow-records")
@RequiredArgsConstructor
public class BorrowRecordController {

    private final BorrowRecordService borrowRecordService;
    private final StudentService studentService;
    private final BookService bookService;
    private final StudentMapper studentMapper;

    @PostMapping("/borrow")
    public ResponseEntity<Object> borrowBook(@Valid @RequestBody BorrowRecordDTO dto) {
        try {
            // FIXED: getStudentById returns StudentDTO
            var studentDTO = studentService.getStudentById(dto.getStudentId());
            Student student = studentMapper.toEntity(studentDTO);

            Book book = bookService.findById(dto.getBookId())
                    .orElseThrow(() -> new IllegalArgumentException("Book not found"));

            BorrowRecord record = borrowRecordService.borrowBook(
                    student,
                    book,
                    (int) java.time.temporal.ChronoUnit.DAYS.between(dto.getBorrowDate(), dto.getDueDate())
            );

            return ResponseHandler.generateResponse(
                    "Book borrowed successfully", HttpStatus.CREATED, record
            );

        } catch (IllegalArgumentException e) {
            return ResponseHandler.generateResponse(e.getMessage(), HttpStatus.NOT_FOUND, null);
        } catch (Exception e) {
            return ResponseHandler.generateResponse("Error borrowing book", HttpStatus.INTERNAL_SERVER_ERROR, e.getMessage());
        }
    }

    @PutMapping("/{borrowRecordId}/return")
    public ResponseEntity<Object> returnBook(@PathVariable Long borrowRecordId) {
        try {
            BorrowRecord updated = borrowRecordService.returnBook(borrowRecordId);
            return ResponseHandler.generateResponse(
                    "Book returned successfully", HttpStatus.OK, updated
            );
        } catch (IllegalArgumentException e) {
            return ResponseHandler.generateResponse(e.getMessage(), HttpStatus.NOT_FOUND, null);
        } catch (Exception e) {
            return ResponseHandler.generateResponse("Error returning book", HttpStatus.INTERNAL_SERVER_ERROR, e.getMessage());
        }
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<Object> getBorrowsByStudent(
            @PathVariable Long studentId,
            Pageable pageable
    ) {
        try {
            // FIXED: getStudentById returns StudentDTO
            var studentDTO = studentService.getStudentById(studentId);
            Student student = studentMapper.toEntity(studentDTO);

            Page<BorrowRecord> records = borrowRecordService.findByStudent(student, pageable);
            return ResponseHandler.generateResponse("Borrow records retrieved", HttpStatus.OK, records);

        } catch (IllegalArgumentException e) {
            return ResponseHandler.generateResponse(e.getMessage(), HttpStatus.NOT_FOUND, null);
        } catch (Exception e) {
            return ResponseHandler.generateResponse("Error retrieving records", HttpStatus.INTERNAL_SERVER_ERROR, e.getMessage());
        }
    }

    @GetMapping("/student/{studentId}/active")
    public ResponseEntity<Object> getActiveBorrowsByStudent(@PathVariable Long studentId) {
        try {
            var studentDTO = studentService.getStudentById(studentId);
            Student student = studentMapper.toEntity(studentDTO);
            java.util.List<BorrowRecord> active = borrowRecordService.findActiveBorrowsByStudent(student);
            return ResponseHandler.generateResponse("Active borrows retrieved", HttpStatus.OK, active);
        } catch (IllegalArgumentException e) {
            return ResponseHandler.generateResponse(e.getMessage(), HttpStatus.NOT_FOUND, null);
        } catch (Exception e) {
            return ResponseHandler.generateResponse("Error retrieving active borrows: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR, null);
        }
    }

    @GetMapping("/overdue")
    public ResponseEntity<Object> getOverdueBorrows(Pageable pageable) {
        try {
            Page<BorrowRecord> overdue = borrowRecordService.findOverdueBorrows(java.time.LocalDateTime.now(), pageable);
            return ResponseHandler.generateResponse("Overdue borrow records retrieved", HttpStatus.OK, overdue);
        } catch (Exception e) {
            return ResponseHandler.generateResponse("Error fetching overdue records", HttpStatus.INTERNAL_SERVER_ERROR, e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Object> getBorrowRecordById(@PathVariable Long id) {
        try {
            return borrowRecordService.findById(id)
                    .map(record -> ResponseHandler.generateResponse("Borrow record found", HttpStatus.OK, record))
                    .orElseGet(() -> ResponseHandler.generateResponse("Borrow record not found", HttpStatus.NOT_FOUND, null));
        } catch (Exception e) {
            return ResponseHandler.generateResponse("Error retrieving borrow record", HttpStatus.INTERNAL_SERVER_ERROR, e.getMessage());
        }
    }

    @GetMapping("/book/{bookId}/active")
    public ResponseEntity<Object> getActiveBorrowByBook(@PathVariable Long bookId) {
        try {
            Book book = bookService.findById(bookId).orElseThrow(() -> new IllegalArgumentException("Book not found"));
            var maybe = borrowRecordService.findActiveBorrowForBook(book);
            if (maybe.isEmpty()) return ResponseHandler.generateResponse("No active borrow found for book", HttpStatus.NOT_FOUND, null);
            return ResponseHandler.generateResponse("Active borrow retrieved", HttpStatus.OK, maybe.get());
        } catch (IllegalArgumentException e) {
            return ResponseHandler.generateResponse(e.getMessage(), HttpStatus.NOT_FOUND, null);
        } catch (Exception e) {
            return ResponseHandler.generateResponse("Error retrieving active borrow: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR, null);
        }
    }
}
