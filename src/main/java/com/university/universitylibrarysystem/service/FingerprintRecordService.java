package com.university.universitylibrarysystem.service;

import com.university.universitylibrarysystem.dto.FingerprintRecordDTO;
import com.university.universitylibrarysystem.entity.FingerprintRecord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Service interface for managing fingerprint records.
 * Defines high-level biometric operations and compliance workflows.
 */
public interface FingerprintRecordService {

    FingerprintRecord createFingerprintRecord(FingerprintRecordDTO dto);

    FingerprintRecord updateFingerprintRecord(Long id, FingerprintRecordDTO dto);

    void deleteFingerprintRecord(Long id);

    Optional<FingerprintRecord> getFingerprintRecordById(Long id);

    Page<FingerprintRecord> getActiveRecords(Pageable pageable);

    Page<FingerprintRecord> getExpiredRecords(Pageable pageable);

    Page<FingerprintRecord> getRecordsNeedingReverification(LocalDateTime threshold, Pageable pageable);

    boolean verifyFingerprint(Long studentId, String fingerprintHash);

    void purgeExpiredRecords();

    List<Object[]> getVerificationStats(LocalDateTime start, LocalDateTime end);
}
