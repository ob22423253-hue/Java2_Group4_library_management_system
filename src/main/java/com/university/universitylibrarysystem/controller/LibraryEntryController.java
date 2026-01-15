package com.university.universitylibrarysystem.controller;

import com.university.universitylibrarysystem.dto.LibraryEntryDTO;
import com.university.universitylibrarysystem.entity.LibraryEntry;
import com.university.universitylibrarysystem.entity.LibraryEntry.EntryMethod;
import com.university.universitylibrarysystem.entity.Student;
import com.university.universitylibrarysystem.service.LibraryEntryService;
import com.university.universitylibrarysystem.service.StudentService;
import com.university.universitylibrarysystem.repository.StudentRepository;
import com.university.universitylibrarysystem.util.ResponseHandler;
import com.university.universitylibrarysystem.mapper.StudentMapper;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Controller for handling library entry/exit events (IN / OUT).
 */
@RestController
@RequestMapping("/library-entries")
@RequiredArgsConstructor
public class LibraryEntryController {

    private final LibraryEntryService libraryEntryService;
    private final StudentService studentService;
    private final StudentRepository studentRepository;
    private final StudentMapper studentMapper;

    @PostMapping
    public ResponseEntity<Object> recordEntry(@Valid @RequestBody LibraryEntryDTO dto) {
        try {
            // Load a managed Student entity from repository to avoid transient-instance errors
            Long dbId = dto.getStudentId();
            var maybeStudent = studentRepository.findById(dbId);
            if (maybeStudent.isEmpty()) throw new IllegalArgumentException("Student not found with ID: " + dbId);
            Student student = maybeStudent.get();

            LocalDateTime timestamp = dto.getTimestamp() != null ? dto.getTimestamp() : LocalDateTime.now();

            if ("IN".equalsIgnoreCase(dto.getEntryType())) {
                LibraryEntry entry = new LibraryEntry();
                entry.setStudent(student);
                entry.setEntryTime(timestamp);
                entry.setEntryMethod(EntryMethod.MANUAL_CHECK);
                entry.setEntryCaptureRef(null);
                entry.setExitCaptureRef(null);
                entry.setNotes(dto.getNotes());
                if (dto.getGateLocation() != null) {
                    entry.setNotes((entry.getNotes() == null ? "" : entry.getNotes() + " ") + "Gate: " + dto.getGateLocation());
                }

                LibraryEntry created = libraryEntryService.createEntry(entry);
                return ResponseHandler.generateResponse("Entry recorded (IN)", HttpStatus.CREATED, mapToDTO(created));
            } else if ("OUT".equalsIgnoreCase(dto.getEntryType())) {
                List<LibraryEntry> active = libraryEntryService.findActiveEntriesByStudent(student);
                if (active == null || active.isEmpty()) {
                    return ResponseHandler.generateResponse("No active entry found for student", HttpStatus.NOT_FOUND, null);
                }

                LibraryEntry toClose = active.stream()
                        .max(Comparator.comparing(LibraryEntry::getEntryTime))
                        .orElse(active.get(0));

                LocalDateTime exitTime = timestamp;
                LibraryEntry closed = libraryEntryService.closeEntry(toClose.getId(), exitTime, null);

                return ResponseHandler.generateResponse("Entry closed (OUT)", HttpStatus.OK, mapToDTO(closed));
            } else {
                return ResponseHandler.generateResponse("Invalid entryType. Use IN or OUT.", HttpStatus.BAD_REQUEST, null);
            }

        } catch (IllegalArgumentException e) {
            return ResponseHandler.generateResponse(e.getMessage(), HttpStatus.NOT_FOUND, null);
        } catch (DateTimeParseException e) {
            return ResponseHandler.generateResponse("Invalid timestamp format: " + e.getMessage(), HttpStatus.BAD_REQUEST, null);
        } catch (Exception e) {
            return ResponseHandler.generateResponse("Error recording library entry: " + e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR, null);
        }
    }

    @PutMapping("/{entryId}/exit")
    public ResponseEntity<Object> closeEntry(
            @PathVariable Long entryId,
            @RequestParam(required = false) String exitCaptureRef,
            @RequestParam(required = false) String exitTimestamp
    ) {
        try {
            LocalDateTime exitTime = (exitTimestamp == null || exitTimestamp.isBlank())
                    ? LocalDateTime.now()
                    : LocalDateTime.parse(exitTimestamp);

            LibraryEntry closed = libraryEntryService.closeEntry(entryId, exitTime, exitCaptureRef);
            return ResponseHandler.generateResponse("Entry closed successfully", HttpStatus.OK, mapToDTO(closed));
        } catch (DateTimeParseException e) {
            return ResponseHandler.generateResponse("Invalid timestamp format: " + e.getMessage(), HttpStatus.BAD_REQUEST, null);
        } catch (IllegalArgumentException e) {
            return ResponseHandler.generateResponse(e.getMessage(), HttpStatus.NOT_FOUND, null);
        } catch (Exception e) {
            return ResponseHandler.generateResponse("Error closing entry: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR, null);
        }
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<Object> getEntriesByStudent(@PathVariable Long studentId, Pageable pageable) {
        try {
            // Load a managed Student entity from repository to avoid transient-instance errors
            Long dbId = studentId;
            var maybeStudent = studentRepository.findById(dbId);
            if (maybeStudent.isEmpty()) throw new IllegalArgumentException("Student not found with ID: " + dbId);
            Student student = maybeStudent.get();

            Page<LibraryEntry> page = libraryEntryService.findEntriesByStudent(student, pageable);
            Page<LibraryEntryDTO> dtoPage = page.map(this::mapToDTO);
            return ResponseHandler.generateResponse("Entries retrieved", HttpStatus.OK, dtoPage);
        } catch (IllegalArgumentException e) {
            return ResponseHandler.generateResponse(e.getMessage(), HttpStatus.NOT_FOUND, null);
        } catch (Exception e) {
            return ResponseHandler.generateResponse("Error fetching entries: " + e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR, null);
        }
    }

    // Lookup entries by university-assigned studentId (string like "12345678")
    @GetMapping("/student-by-student-id/{studentId}")
    public ResponseEntity<Object> getEntriesByStudentId(@PathVariable String studentId, Pageable pageable) {
        try {
            // Lookup by university-assigned studentId (string) and return managed Student
            var maybe = studentRepository.findByStudentId(studentId);
            if (maybe.isEmpty()) throw new IllegalArgumentException("Student not found with studentId: " + studentId);
            Student student = maybe.get();

            Page<LibraryEntry> page = libraryEntryService.findEntriesByStudent(student, pageable);
            Page<LibraryEntryDTO> dtoPage = page.map(this::mapToDTO);
            return ResponseHandler.generateResponse("Entries retrieved", HttpStatus.OK, dtoPage);
        } catch (IllegalArgumentException e) {
            return ResponseHandler.generateResponse(e.getMessage(), HttpStatus.NOT_FOUND, null);
        } catch (Exception e) {
            return ResponseHandler.generateResponse("Error fetching entries: " + e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR, null);
        }
    }

    @GetMapping("/current-count")
    public ResponseEntity<Object> countCurrentlyInLibrary() {
        try {
            long count = libraryEntryService.countCurrentlyInLibrary();
            Map<String, Object> payload = new HashMap<>();
            payload.put("currentlyInLibrary", count);
            return ResponseHandler.generateResponse("Current in-library count retrieved", HttpStatus.OK, payload);
        } catch (Exception e) {
            return ResponseHandler.generateResponse("Error fetching current count: " + e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR, null);
        }
    }

    @GetMapping("/statistics")
    public ResponseEntity<Object> getStatistics(@RequestParam String start, @RequestParam String end) {
        try {
            LocalDateTime startTime = LocalDateTime.parse(start);
            LocalDateTime endTime = LocalDateTime.parse(end);

            List<LibraryEntry> entries = libraryEntryService.findEntriesBetween(startTime, endTime);

            Map<String, Map<String, Long>> grouped = new TreeMap<>();
            for (LibraryEntry e : entries) {
                String dateKey = e.getEntryTime().toLocalDate().toString();
                grouped.computeIfAbsent(dateKey, k -> {
                    Map<String, Long> m = new HashMap<>();
                    m.put("entries", 0L);
                    m.put("exits", 0L);
                    return m;
                });
                grouped.get(dateKey).put("entries", grouped.get(dateKey).get("entries") + 1);
                if (e.getExitTime() != null) {
                    String exitDateKey = e.getExitTime().toLocalDate().toString();
                    grouped.computeIfAbsent(exitDateKey, k -> {
                        Map<String, Long> m = new HashMap<>();
                        m.put("entries", 0L);
                        m.put("exits", 0L);
                        return m;
                    });
                    grouped.get(exitDateKey).put("exits", grouped.get(exitDateKey).get("exits") + 1);
                }
            }

            List<Map<String, Object>> stats = grouped.entrySet().stream()
                    .map(en -> {
                        Map<String, Object> r = new HashMap<>();
                        r.put("date", en.getKey());
                        r.put("entries", en.getValue().getOrDefault("entries", 0L));
                        r.put("exits", en.getValue().getOrDefault("exits", 0L));
                        return r;
                    })
                    .collect(Collectors.toList());

            return ResponseHandler.generateResponse("Entry statistics retrieved", HttpStatus.OK, stats);

        } catch (DateTimeParseException e) {
            return ResponseHandler.generateResponse("Invalid date format. Use ISO-8601", HttpStatus.BAD_REQUEST, null);
        } catch (Exception e) {
            return ResponseHandler.generateResponse("Error computing statistics: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR, null);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Object> getEntryById(@PathVariable Long id) {
        try {
            Optional<LibraryEntry> maybe = libraryEntryService.findById(id);
            if (maybe.isEmpty()) {
                return ResponseHandler.generateResponse("Entry not found", HttpStatus.NOT_FOUND, null);
            }
            return ResponseHandler.generateResponse("Entry retrieved", HttpStatus.OK, mapToDTO(maybe.get()));
        } catch (Exception e) {
            return ResponseHandler.generateResponse("Error retrieving entry: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR, null);
        }
    }

    private LibraryEntryDTO mapToDTO(LibraryEntry e) {
        LibraryEntryDTO dto = new LibraryEntryDTO();
        dto.setId(e.getId());
        dto.setStudentId(e.getStudent() != null ? e.getStudent().getId() : null);
        dto.setEntryType(e.isInLibrary() ? "IN" : "OUT");
        dto.setTimestamp(e.getEntryTime());
        dto.setGateLocation(null);
        dto.setNotes(e.getNotes());
        return dto;
    }
}
