package com.university.universitylibrarysystem.controller;

import org.springframework.transaction.annotation.Transactional;
import com.university.universitylibrarysystem.dto.ScanRequestDTO;
import com.university.universitylibrarysystem.entity.LibraryEntry;
import com.university.universitylibrarysystem.entity.Student;
import com.university.universitylibrarysystem.repository.LibraryEntryRepository;
import com.university.universitylibrarysystem.repository.StudentRepository;
import com.university.universitylibrarysystem.service.LibraryHoursService;
import com.university.universitylibrarysystem.util.ResponseHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@RequestMapping
public class ScanController {

    private final LibraryEntryRepository libraryEntryRepository;
    private final StudentRepository studentRepository;
    private final LibraryHoursService libraryHoursService;

    @Transactional
    @PostMapping("/scan")
    public ResponseEntity<Object> scan(@RequestBody(required = false) ScanRequestDTO request) {
        try {
            // Block scanning if library is closed
            if (!libraryHoursService.isLibraryOpen()) {
                return ResponseHandler.generateResponse(
                        "Library is currently closed. Scanning is not allowed.",
                        HttpStatus.FORBIDDEN, null);
            }

            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || auth.getName() == null) {
                return ResponseHandler.generateResponse("Unauthorized", HttpStatus.UNAUTHORIZED, null);
            }

            String studentId = auth.getName();
            Student student = studentRepository.findByStudentId(studentId)
                    .orElseThrow(() -> new IllegalArgumentException("Student not found: " + studentId));

            String qrValue = request != null ? request.getQrValue() : null;
            String scanTypeRaw = request != null ? request.getScanType() : null;

            if (qrValue == null ||
                !(qrValue.equalsIgnoreCase("LIBRARY_ENTRY") || qrValue.equalsIgnoreCase("LIBRARY_EXIT"))) {
                return ResponseHandler.generateResponse("Invalid or missing QR code", HttpStatus.BAD_REQUEST, null);
            }

            boolean isEntry;
            if (scanTypeRaw != null) {
                isEntry = scanTypeRaw.equalsIgnoreCase("ENTRY");
            } else {
                isEntry = qrValue.equalsIgnoreCase("LIBRARY_ENTRY");
            }

            LocalDateTime scanTime = (request != null && request.getScanTime() != null)
                    ? request.getScanTime()
                    : LocalDateTime.now();

            if (isEntry) {
                List<LibraryEntry> openEntries = libraryEntryRepository.findByStudentAndExitTimeIsNull(student);
                if (!openEntries.isEmpty()) {
                    return ResponseHandler.generateResponse("Student already has an open entry", HttpStatus.BAD_REQUEST, null);
                }

                LibraryEntry entry = new LibraryEntry();
                entry.setStudent(student);
                entry.setEntryTime(scanTime);
                entry.setEntryMethod(LibraryEntry.EntryMethod.QR);
                entry.setEntryCaptureRef(qrValue);

                LibraryEntry saved = libraryEntryRepository.save(entry);
                return ResponseHandler.generateResponse("Entry recorded successfully", HttpStatus.CREATED, saved);
            }

            // EXIT
            List<LibraryEntry> openEntries = libraryEntryRepository.findByStudentAndExitTimeIsNull(student);
            if (openEntries.isEmpty()) {
                return ResponseHandler.generateResponse("No active entry found for student", HttpStatus.BAD_REQUEST, null);
            }

            LibraryEntry activeEntry = openEntries.get(openEntries.size() - 1);
            activeEntry.setExitTime(scanTime);
            activeEntry.setExitCaptureRef(qrValue);

            LibraryEntry saved = libraryEntryRepository.save(activeEntry);
            return ResponseHandler.generateResponse("Exit recorded successfully", HttpStatus.OK, saved);

        } catch (IllegalArgumentException e) {
            return ResponseHandler.generateResponse(e.getMessage(), HttpStatus.NOT_FOUND, null);
        } catch (Exception e) {
            return ResponseHandler.generateResponse("Error recording scan: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR, null);
        }
    }

    @Transactional
    @GetMapping("/librarian/scans")
    public ResponseEntity<Object> getAllScans() {
        try {
            List<LibraryEntry> entries = libraryEntryRepository.findAll();

            List<Map<String, Object>> result = entries.stream().map(e -> {
                Map<String, Object> map = new LinkedHashMap<>();
                map.put("id", e.getId());
                map.put("entryTime", e.getEntryTime());
                map.put("exitTime", e.getExitTime());
                map.put("entryMethod", e.getEntryMethod());
                map.put("notes", e.getNotes());

                Student s = e.getStudent();
                if (s != null) {
                    Map<String, Object> studentMap = new LinkedHashMap<>();
                    studentMap.put("id", s.getId());
                    studentMap.put("studentId", s.getStudentId());
                    studentMap.put("firstName", s.getFirstName());
                    studentMap.put("lastName", s.getLastName());
                    studentMap.put("department", s.getDepartment());
                    studentMap.put("email", s.getEmail());
                    studentMap.put("major", s.getMajor());
                    studentMap.put("minorSubject", s.getMinorSubject());
                    studentMap.put("yearLevel", s.getYearLevel());
                    studentMap.put("phoneNumber", s.getPhoneNumber());
                    map.put("student", studentMap);
                } else {
                    map.put("student", null);
                }
                return map;
            }).collect(Collectors.toList());

            return ResponseHandler.generateResponse("Library scan records", HttpStatus.OK, result);

        } catch (Exception e) {
            return ResponseHandler.generateResponse("Error fetching scans: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR, null);
        }
    }
}