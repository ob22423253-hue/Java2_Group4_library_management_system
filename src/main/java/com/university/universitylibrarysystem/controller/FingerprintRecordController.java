package com.university.universitylibrarysystem.controller;

import com.university.universitylibrarysystem.dto.FingerprintRecordDTO;
import com.university.universitylibrarysystem.entity.FingerprintRecord;
import com.university.universitylibrarysystem.service.FingerprintRecordService;
import com.university.universitylibrarysystem.util.ResponseHandler;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

/**
 * REST controller for managing fingerprint records.
 * Supports CRUD, verification, and retention management.
 */
@RestController
@RequestMapping("/fingerprints")
@RequiredArgsConstructor
public class FingerprintRecordController {

    private final FingerprintRecordService fingerprintService;

    // ------------------- CREATE -------------------

    @PostMapping
    public ResponseEntity<Object> createFingerprint(@Valid @RequestBody FingerprintRecordDTO dto) {
        FingerprintRecord record = fingerprintService.createFingerprintRecord(dto);
        return ResponseHandler.generateResponse("Fingerprint record created successfully", HttpStatus.CREATED, record);
    }

    // ------------------- READ -------------------

    @GetMapping("/{id}")
    public ResponseEntity<Object> getFingerprintById(@PathVariable Long id) {
        return fingerprintService.getFingerprintRecordById(id)
                .map(record -> ResponseHandler.generateResponse("Fingerprint record found", HttpStatus.OK, record))
                .orElse(ResponseHandler.generateResponse("Fingerprint record not found", HttpStatus.NOT_FOUND, null));
    }

    @GetMapping("/active")
    public ResponseEntity<Object> getActiveRecords(Pageable pageable) {
        Page<FingerprintRecord> records = fingerprintService.getActiveRecords(pageable);
        return ResponseHandler.generateResponse("Active fingerprint records retrieved", HttpStatus.OK, records);
    }

    @GetMapping("/expired")
    public ResponseEntity<Object> getExpiredRecords(Pageable pageable) {
        Page<FingerprintRecord> records = fingerprintService.getExpiredRecords(pageable);
        return ResponseHandler.generateResponse("Expired fingerprint records retrieved", HttpStatus.OK, records);
    }

    @GetMapping("/reverification")
    public ResponseEntity<Object> getRecordsNeedingReverification(
            @RequestParam LocalDateTime threshold, Pageable pageable) {
        Page<FingerprintRecord> records = fingerprintService.getRecordsNeedingReverification(threshold, pageable);
        return ResponseHandler.generateResponse("Records needing reverification retrieved", HttpStatus.OK, records);
    }

    // ------------------- UPDATE -------------------

    @PutMapping("/{id}")
    public ResponseEntity<Object> updateFingerprint(@PathVariable Long id, @Valid @RequestBody FingerprintRecordDTO dto) {
        FingerprintRecord updated = fingerprintService.updateFingerprintRecord(id, dto);
        return ResponseHandler.generateResponse("Fingerprint record updated successfully", HttpStatus.OK, updated);
    }

    // ------------------- DELETE -------------------

    @DeleteMapping("/{id}")
    public ResponseEntity<Object> deleteFingerprint(@PathVariable Long id) {
        fingerprintService.deleteFingerprintRecord(id);
        return ResponseHandler.generateResponse("Fingerprint record deleted successfully", HttpStatus.OK, null);
    }

    // ------------------- VERIFICATION -------------------

    @PostMapping("/verify")
    public ResponseEntity<Object> verifyFingerprint(
            @RequestParam Long studentId,
            @RequestParam String fingerprintHash) {
        boolean verified = fingerprintService.verifyFingerprint(studentId, fingerprintHash);
        String message = verified ? "Fingerprint verified successfully" : "Fingerprint verification failed";
        return ResponseHandler.generateResponse(message, HttpStatus.OK, Map.of("verified", verified));
    }

    // ------------------- STATS -------------------

    @GetMapping("/stats")
    public ResponseEntity<Object> getVerificationStats(
            @RequestParam LocalDateTime start,
            @RequestParam LocalDateTime end) {
        List<Object[]> stats = fingerprintService.getVerificationStats(start, end);
        return ResponseHandler.generateResponse("Verification stats retrieved", HttpStatus.OK, stats);
    }

    // ------------------- RETENTION -------------------

    @DeleteMapping("/purge-expired")
    public ResponseEntity<Object> purgeExpired() {
        fingerprintService.purgeExpiredRecords();
        return ResponseHandler.generateResponse("Expired fingerprint records purged", HttpStatus.OK, null);
    }
}
