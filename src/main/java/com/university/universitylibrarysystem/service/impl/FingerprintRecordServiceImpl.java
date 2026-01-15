package com.university.universitylibrarysystem.service.impl;

import com.university.universitylibrarysystem.dto.FingerprintRecordDTO;
import com.university.universitylibrarysystem.entity.FingerprintRecord;
import com.university.universitylibrarysystem.entity.Student;
import com.university.universitylibrarysystem.repository.FingerprintRecordRepository;
import com.university.universitylibrarysystem.repository.StudentRepository;
import com.university.universitylibrarysystem.service.FingerprintRecordService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.*;

/**
 * Implementation of FingerprintRecordService.
 * Handles logic for biometric lifecycle management and compliance.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class FingerprintRecordServiceImpl implements FingerprintRecordService {

    private final FingerprintRecordRepository fingerprintRepository;
    private final StudentRepository studentRepository;

    @Override
    public FingerprintRecord createFingerprintRecord(FingerprintRecordDTO dto) {
        Student student = studentRepository.findById(dto.getStudentId())
                .orElseThrow(() -> new EntityNotFoundException("Student not found with ID: " + dto.getStudentId()));

        FingerprintRecord record = new FingerprintRecord();
        record.setStudent(student);
        record.setTemplateData(dto.getFingerprintHash().getBytes(StandardCharsets.UTF_8));
        record.setTemplateHash(hashFingerprint(dto.getFingerprintHash()));
        record.setFingerPosition(FingerprintRecord.FingerPosition.RIGHT_INDEX);
        record.setConsentDate(LocalDateTime.now());
        record.setQualityScore(85); // Example default
        return fingerprintRepository.save(record);
    }

    @Override
    public FingerprintRecord updateFingerprintRecord(Long id, FingerprintRecordDTO dto) {
        FingerprintRecord existing = fingerprintRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Fingerprint record not found"));

        existing.setTemplateHash(hashFingerprint(dto.getFingerprintHash()));
        existing.setTemplateData(dto.getFingerprintHash().getBytes(StandardCharsets.UTF_8));
        existing.setUpdatedAt(LocalDateTime.now());
        return fingerprintRepository.save(existing);
    }

    @Override
    public void deleteFingerprintRecord(Long id) {
        if (!fingerprintRepository.existsById(id)) {
            throw new EntityNotFoundException("Fingerprint record not found with ID " + id);
        }
        fingerprintRepository.deleteById(id);
    }

    @Override
    public Optional<FingerprintRecord> getFingerprintRecordById(Long id) {
        return fingerprintRepository.findById(id);
    }

    @Override
    public Page<FingerprintRecord> getActiveRecords(Pageable pageable) {
        return fingerprintRepository.findActiveRecords(LocalDateTime.now(), pageable);
    }

    @Override
    public Page<FingerprintRecord> getExpiredRecords(Pageable pageable) {
        return fingerprintRepository.findExpiredRecords(LocalDateTime.now(), pageable);
    }

    @Override
    public Page<FingerprintRecord> getRecordsNeedingReverification(LocalDateTime threshold, Pageable pageable) {
        return fingerprintRepository.findRecordsNeedingReverification(threshold, pageable);
    }

    @Override
    public boolean verifyFingerprint(Long studentId, String fingerprintHash) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new EntityNotFoundException("Student not found"));

        Optional<FingerprintRecord> recordOpt = fingerprintRepository.findByStudent(student);
        if (recordOpt.isEmpty()) return false;

        FingerprintRecord record = recordOpt.get();
        String computedHash = hashFingerprint(fingerprintHash);

        boolean match = record.validateTemplateIntegrity(computedHash);
        record.setUpdatedAt(LocalDateTime.now());
        fingerprintRepository.save(record);
        return match;
    }

    @Override
    public void purgeExpiredRecords() {
        Page<FingerprintRecord> expired = fingerprintRepository.findExpiredRecords(LocalDateTime.now(), Pageable.unpaged());
        expired.forEach(fingerprintRepository::delete);
    }

    @Override
    public List<Object[]> getVerificationStats(LocalDateTime start, LocalDateTime end) {
        return fingerprintRepository.getVerificationStatistics(start, end);
    }

    // Utility
    private String hashFingerprint(String data) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashed = digest.digest(data.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hashed);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Unable to hash fingerprint data", e);
        }
    }
}
