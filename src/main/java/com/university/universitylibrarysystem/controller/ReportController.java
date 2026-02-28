package com.university.universitylibrarysystem.controller;

import com.university.universitylibrarysystem.entity.BorrowRecord;
import com.university.universitylibrarysystem.entity.LibraryEntry;
import com.university.universitylibrarysystem.entity.Student;
import com.university.universitylibrarysystem.repository.BorrowRecordRepository;
import com.university.universitylibrarysystem.repository.LibraryEntryRepository;
import com.university.universitylibrarysystem.repository.StudentRepository;
import com.university.universitylibrarysystem.util.ResponseHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/reports")
@RequiredArgsConstructor
public class ReportController {

    private final LibraryEntryRepository libraryEntryRepository;
    private final BorrowRecordRepository borrowRecordRepository;
    private final StudentRepository studentRepository;

    // ---- LIBRARIAN FULL REPORT ----
    @GetMapping("/librarian/summary")
    @Transactional(readOnly = true)
    public ResponseEntity<Object> getLibrarianSummary(@RequestParam String period) {

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime start = getStartDate(period, now);

        List<LibraryEntry> entries = libraryEntryRepository.findAllWithStudent()
                .stream()
                .filter(e -> e.getEntryTime().isAfter(start) &&
                        e.getEntryTime().isBefore(now))
                .collect(Collectors.toList());

        List<BorrowRecord> borrows = borrowRecordRepository.findAll().stream()
                .filter(b -> b.getBorrowDate() != null &&
                        b.getBorrowDate().isAfter(start))
                .collect(Collectors.toList());

        List<Student> allStudents = studentRepository.findAll();

        Map<String, Object> report = new LinkedHashMap<>();
        report.put("period", period);
        report.put("startDate", start.toString());
        report.put("endDate", now.toString());
        report.put("totalStudents", allStudents.size());
        report.put("totalVisits", entries.size());
        report.put("uniqueVisitors", entries.stream()
                .filter(e -> e.getStudent() != null)
                .map(e -> e.getStudent().getId())
                .collect(Collectors.toSet()).size());
        report.put("totalBorrows", borrows.size());
        report.put("totalReturns", borrows.stream()
                .filter(b -> b.getReturnDate() != null).count());
        report.put("overdueBooks", borrows.stream()
                .filter(b -> b.getStatus() == BorrowRecord.BorrowStatus.OVERDUE
                        || b.isOverdue()).count());

        double avgDuration = entries.stream()
                .filter(e -> e.getExitTime() != null)
                .mapToLong(e -> ChronoUnit.MINUTES.between(
                        e.getEntryTime(), e.getExitTime()))
                .average().orElse(0);
        report.put("avgVisitDurationMinutes", Math.round(avgDuration));

        Map<String, Long> visitsByDay = entries.stream()
                .collect(Collectors.groupingBy(
                        e -> e.getEntryTime().getDayOfWeek().toString(),
                        Collectors.counting()));
        report.put("visitsByDayOfWeek", visitsByDay);

        Map<String, Long> visitsByHour = entries.stream()
                .collect(Collectors.groupingBy(
                        e -> e.getEntryTime().getHour() + ":00",
                        Collectors.counting()));
        report.put("visitsByHour", new TreeMap<>(visitsByHour));

        // Normalize department to uppercase and trim to avoid duplicates
        Map<String, Long> visitsByDept = entries.stream()
                .filter(e -> e.getStudent() != null &&
                        e.getStudent().getDepartment() != null)
                .collect(Collectors.groupingBy(
                        e -> e.getStudent().getDepartment().toUpperCase().trim(),
                        Collectors.counting()));
        report.put("visitsByDepartment", visitsByDept);

        Map<String, Long> visitsByYear = entries.stream()
                .filter(e -> e.getStudent() != null &&
                        e.getStudent().getYearLevel() != null)
                .collect(Collectors.groupingBy(
                        e -> "Year " + e.getStudent().getYearLevel(),
                        Collectors.counting()));
        report.put("visitsByYearLevel", visitsByYear);

        Map<String, Long> dailyTrend = entries.stream()
                .collect(Collectors.groupingBy(
                        e -> e.getEntryTime().toLocalDate().toString(),
                        TreeMap::new,
                        Collectors.counting()));
        report.put("dailyVisitTrend", dailyTrend);

        Map<Long, Long> visitCounts = entries.stream()
                .filter(e -> e.getStudent() != null)
                .collect(Collectors.groupingBy(
                        e -> e.getStudent().getId(),
                        Collectors.counting()));
        List<Map<String, Object>> topVisitors = visitCounts.entrySet().stream()
                .sorted(Map.Entry.<Long, Long>comparingByValue().reversed())
                .limit(10)
                .map(ev -> {
                    Student s = studentRepository.findById(ev.getKey()).orElse(null);
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("studentId", s != null ? s.getStudentId() : "—");
                    m.put("name", s != null ?
                            s.getFirstName() + " " + s.getLastName() : "—");
                    m.put("department", s != null ?
                            s.getDepartment().toUpperCase().trim() : "—");
                    m.put("visits", ev.getValue());
                    return m;
                })
                .collect(Collectors.toList());
        report.put("topVisitors", topVisitors);

        Map<Long, Long> bookBorrowCounts = borrows.stream()
                .collect(Collectors.groupingBy(
                        b -> b.getBook().getId(),
                        Collectors.counting()));
        List<Map<String, Object>> topBooks = bookBorrowCounts.entrySet().stream()
                .sorted(Map.Entry.<Long, Long>comparingByValue().reversed())
                .limit(10)
                .map(eb -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    borrows.stream()
                            .filter(b -> b.getBook().getId().equals(eb.getKey()))
                            .findFirst()
                            .ifPresent(b -> {
                                m.put("title", b.getBook().getTitle());
                                m.put("author", b.getBook().getAuthor());
                                m.put("category", b.getBook().getCategory());
                            });
                    m.put("borrowCount", eb.getValue());
                    return m;
                })
                .collect(Collectors.toList());
        report.put("topBorrowedBooks", topBooks);

        return ResponseHandler.generateResponse("Report generated", HttpStatus.OK, report);
    }

    // ---- STUDENT PERSONAL REPORT ----
    @GetMapping("/student/{studentDbId}/summary")
    @Transactional(readOnly = true)
    public ResponseEntity<Object> getStudentSummary(
            @PathVariable Long studentDbId,
            @RequestParam String period) {

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime start = getStartDate(period, now);

        Student student = studentRepository.findById(studentDbId)
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));

        List<LibraryEntry> allEntries = libraryEntryRepository.findAllWithStudent()
                .stream()
                .filter(e -> e.getStudent() != null &&
                        e.getStudent().getId().equals(studentDbId) &&
                        e.getEntryTime().isAfter(start))
                .collect(Collectors.toList());

        List<BorrowRecord> allBorrows = borrowRecordRepository.findAll().stream()
                .filter(b -> b.getStudent().getId().equals(studentDbId) &&
                        b.getBorrowDate().isAfter(start))
                .collect(Collectors.toList());

        Map<String, Object> report = new LinkedHashMap<>();
        report.put("period", period);
        report.put("studentId", student.getStudentId());
        report.put("name", student.getFirstName() + " " + student.getLastName());
        report.put("department", student.getDepartment() != null ?
                student.getDepartment().toUpperCase().trim() : "—");
        report.put("totalVisits", allEntries.size());

        double avgDuration = allEntries.stream()
                .filter(e -> e.getExitTime() != null)
                .mapToLong(e -> ChronoUnit.MINUTES.between(
                        e.getEntryTime(), e.getExitTime()))
                .average().orElse(0);
        report.put("avgVisitDurationMinutes", Math.round(avgDuration));

        Map<String, Long> visitsByDay = allEntries.stream()
                .collect(Collectors.groupingBy(
                        e -> e.getEntryTime().getDayOfWeek().toString(),
                        Collectors.counting()));
        report.put("visitsByDayOfWeek", visitsByDay);

        Map<String, Long> dailyTrend = allEntries.stream()
                .collect(Collectors.groupingBy(
                        e -> e.getEntryTime().toLocalDate().toString(),
                        TreeMap::new,
                        Collectors.counting()));
        report.put("dailyVisitTrend", dailyTrend);

        report.put("totalBorrows", allBorrows.size());
        report.put("totalReturns", allBorrows.stream()
                .filter(b -> b.getReturnDate() != null).count());
        report.put("overdueCount", allBorrows.stream()
                .filter(b -> b.getStatus() ==
                        BorrowRecord.BorrowStatus.OVERDUE || b.isOverdue())
                .count());
        report.put("totalFines", allBorrows.stream()
                .mapToDouble(b -> b.getFineAmount() != null ?
                        b.getFineAmount() : 0.0)
                .sum());

        List<Map<String, Object>> borrowHistory = allBorrows.stream()
                .map(b -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("title", b.getBook().getTitle());
                    m.put("author", b.getBook().getAuthor());
                    m.put("borrowDate", b.getBorrowDate().toString());
                    m.put("dueDate", b.getDueDate().toString());
                    m.put("returnDate", b.getReturnDate() != null ?
                            b.getReturnDate().toString() : null);
                    m.put("status", b.getStatus().toString());
                    m.put("fine", b.getFineAmount());
                    return m;
                })
                .collect(Collectors.toList());
        report.put("borrowHistory", borrowHistory);

        return ResponseHandler.generateResponse(
                "Student report generated", HttpStatus.OK, report);
    }

    private LocalDateTime getStartDate(String period, LocalDateTime now) {
        return switch (period.toUpperCase()) {
            case "TODAY" -> now.toLocalDate().atStartOfDay();
            case "WEEK" -> now.minus(7, ChronoUnit.DAYS);
            case "MONTH" -> now.minus(30, ChronoUnit.DAYS);
            case "YEAR" -> now.minus(365, ChronoUnit.DAYS);
            default -> now.minus(30, ChronoUnit.DAYS);
        };
    }
}