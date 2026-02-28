package com.university.universitylibrarysystem.controller;

import com.university.universitylibrarysystem.dto.BorrowRecordDTO;
import com.university.universitylibrarysystem.entity.Book;
import com.university.universitylibrarysystem.entity.BorrowRecord;
import com.university.universitylibrarysystem.entity.Student;
import com.university.universitylibrarysystem.repository.BookRepository;
import com.university.universitylibrarysystem.repository.StudentRepository;
import com.university.universitylibrarysystem.service.BookService;
import com.university.universitylibrarysystem.service.BorrowRecordService;
import com.university.universitylibrarysystem.service.StudentService;
import com.university.universitylibrarysystem.util.ResponseHandler;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/borrow-records")
@RequiredArgsConstructor
public class BorrowRecordController {

    private final BorrowRecordService borrowRecordService;
    private final StudentService studentService;
    private final BookService bookService;
    private final StudentRepository studentRepository;
    private final BookRepository bookRepository;

    // Safe serialization — only extract what the frontend needs
    private Map<String, Object> toSafeMap(BorrowRecord record) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", record.getId());
        map.put("borrowDate", record.getBorrowDate());
        map.put("dueDate", record.getDueDate());
        map.put("returnDate", record.getReturnDate());
        map.put("status", record.getStatus());
        map.put("fineAmount", record.getFineAmount());
        map.put("notes", record.getNotes());

        if (record.getBook() != null) {
            Map<String, Object> book = new HashMap<>();
            book.put("id", record.getBook().getId());
            book.put("title", record.getBook().getTitle());
            book.put("author", record.getBook().getAuthor());
            book.put("isbn", record.getBook().getIsbn());
            book.put("category", record.getBook().getCategory());
            map.put("book", book);
        }

        if (record.getStudent() != null) {
            Map<String, Object> student = new HashMap<>();
            student.put("id", record.getStudent().getId());
            student.put("studentId", record.getStudent().getStudentId());
            student.put("firstName", record.getStudent().getFirstName());
            student.put("lastName", record.getStudent().getLastName());
            map.put("student", student);
        }

        return map;
    }

    @PostMapping("/borrow")
    public ResponseEntity<Object> borrowBook(@Valid @RequestBody BorrowRecordDTO dto) {
        try {
            Student student = studentRepository.findById(dto.getStudentId())
                    .orElseThrow(() -> new IllegalArgumentException("Student not found"));

            Book book = bookService.findById(dto.getBookId())
                    .orElseThrow(() -> new IllegalArgumentException("Book not found"));

            long loanDays = dto.getDueDate() != null
                    ? java.time.temporal.ChronoUnit.DAYS.between(java.time.LocalDate.now(), dto.getDueDate())
                    : 14;
            if (loanDays < 1) loanDays = 1;

            BorrowRecord record = borrowRecordService.borrowBook(student, book, (int) loanDays);
            return ResponseHandler.generateResponse("Book borrowed successfully", HttpStatus.CREATED, toSafeMap(record));

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
            return ResponseHandler.generateResponse("Book returned successfully", HttpStatus.OK, toSafeMap(updated));
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
            Student student = studentRepository.findById(studentId)
                    .orElseThrow(() -> new IllegalArgumentException("Student not found"));
            Page<BorrowRecord> records = borrowRecordService.findByStudent(student, pageable);
            List<Map<String, Object>> safe = records.getContent().stream()
                    .map(this::toSafeMap).collect(Collectors.toList());
            return ResponseHandler.generateResponse("Borrow records retrieved", HttpStatus.OK, safe);
        } catch (IllegalArgumentException e) {
            return ResponseHandler.generateResponse(e.getMessage(), HttpStatus.NOT_FOUND, null);
        } catch (Exception e) {
            return ResponseHandler.generateResponse("Error retrieving records", HttpStatus.INTERNAL_SERVER_ERROR, e.getMessage());
        }
    }

    @GetMapping("/student/{studentId}/active")
    public ResponseEntity<Object> getActiveBorrowsByStudent(@PathVariable Long studentId) {
        try {
            Student student = studentRepository.findById(studentId)
                    .orElseThrow(() -> new IllegalArgumentException("Student not found"));
            List<BorrowRecord> active = borrowRecordService.findActiveBorrowsByStudent(student);
            List<Map<String, Object>> safe = active.stream()
                    .map(this::toSafeMap).collect(Collectors.toList());
            return ResponseHandler.generateResponse("Active borrows retrieved", HttpStatus.OK, safe);
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
            List<Map<String, Object>> safe = overdue.getContent().stream()
                    .map(this::toSafeMap).collect(Collectors.toList());
            return ResponseHandler.generateResponse("Overdue borrow records retrieved", HttpStatus.OK, safe);
        } catch (Exception e) {
            return ResponseHandler.generateResponse("Error fetching overdue records", HttpStatus.INTERNAL_SERVER_ERROR, e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Object> getBorrowRecordById(@PathVariable Long id) {
        try {
            return borrowRecordService.findById(id)
                    .map(record -> ResponseHandler.generateResponse("Borrow record found", HttpStatus.OK, toSafeMap(record)))
                    .orElseGet(() -> ResponseHandler.generateResponse("Borrow record not found", HttpStatus.NOT_FOUND, null));
        } catch (Exception e) {
            return ResponseHandler.generateResponse("Error retrieving borrow record", HttpStatus.INTERNAL_SERVER_ERROR, e.getMessage());
        }
    }

    @GetMapping("/book/{bookId}/active")
    public ResponseEntity<Object> getActiveBorrowByBook(@PathVariable Long bookId) {
        try {
            Book book = bookService.findById(bookId)
                    .orElseThrow(() -> new IllegalArgumentException("Book not found"));
            var maybe = borrowRecordService.findActiveBorrowForBook(book);
            if (maybe.isEmpty()) return ResponseHandler.generateResponse("No active borrow found for book", HttpStatus.NOT_FOUND, null);
            return ResponseHandler.generateResponse("Active borrow retrieved", HttpStatus.OK, toSafeMap(maybe.get()));
        } catch (IllegalArgumentException e) {
            return ResponseHandler.generateResponse(e.getMessage(), HttpStatus.NOT_FOUND, null);
        } catch (Exception e) {
            return ResponseHandler.generateResponse("Error retrieving active borrow: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR, null);
        }
    }
    @PutMapping("/{borrowRecordId}/fine")
    public ResponseEntity<Object> applyFine(
            @PathVariable Long borrowRecordId,
            @RequestBody Map<String, Object> body) {
        try {
            double amount = Double.parseDouble(body.getOrDefault("fineAmount", 0).toString());
            String reason = body.getOrDefault("reason", "").toString();
            BorrowRecord updated = borrowRecordService.applyManualFine(borrowRecordId, amount, reason);
            return ResponseHandler.generateResponse("Fine applied successfully", HttpStatus.OK, toSafeMap(updated));
        } catch (IllegalArgumentException e) {
            return ResponseHandler.generateResponse(e.getMessage(), HttpStatus.NOT_FOUND, null);
        } catch (Exception e) {
            return ResponseHandler.generateResponse("Error applying fine: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR, null);
        }
    }

    @PutMapping("/{borrowRecordId}/fine/paid")
    public ResponseEntity<Object> markFinePaid(@PathVariable Long borrowRecordId) {
        try {
            BorrowRecord updated = borrowRecordService.markFinePaid(borrowRecordId);
            return ResponseHandler.generateResponse("Fine marked as paid", HttpStatus.OK, toSafeMap(updated));
        } catch (IllegalArgumentException e) {
            return ResponseHandler.generateResponse(e.getMessage(), HttpStatus.NOT_FOUND, null);
        } catch (Exception e) {
            return ResponseHandler.generateResponse("Error marking fine paid: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR, null);
        }
    }

    @GetMapping("/fines")
    public ResponseEntity<Object> getAllFines() {
        try {
            List<BorrowRecord> records = borrowRecordService.findRecordsWithFines();
            List<Map<String, Object>> safe = records.stream()
                    .map(this::toSafeMap).collect(Collectors.toList());
            return ResponseHandler.generateResponse("Fine records retrieved", HttpStatus.OK, safe);
        } catch (Exception e) {
            return ResponseHandler.generateResponse("Error retrieving fines: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR, null);
        }
    }
}