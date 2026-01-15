package com.university.universitylibrarysystem.repository;

import com.university.universitylibrarysystem.entity.FingerprintRecord;
import com.university.universitylibrarysystem.entity.Student;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface FingerprintRecordRepository extends JpaRepository<FingerprintRecord, Long> {

    Optional<FingerprintRecord> findByStudent(Student student);

    @Query("SELECT f FROM FingerprintRecord f WHERE " +
           "f.retentionEndDate IS NULL OR f.retentionEndDate > :currentDate")
    Page<FingerprintRecord> findActiveRecords(
        @Param("currentDate") LocalDateTime currentDate,
        Pageable pageable
    );

    @Query("SELECT f FROM FingerprintRecord f WHERE " +
           "f.retentionEndDate IS NOT NULL AND f.retentionEndDate <= :currentDate")
    Page<FingerprintRecord> findExpiredRecords(
        @Param("currentDate") LocalDateTime currentDate,
        Pageable pageable
    );

    Page<FingerprintRecord> findByIsVerified(boolean isVerified, Pageable pageable);

    @Query("SELECT DATE(f.lastVerifiedAt) as date, " +
           "SUM(CASE WHEN f.isVerified = true THEN 1 ELSE 0 END) as successful, " +
           "SUM(CASE WHEN f.isVerified = false THEN 1 ELSE 0 END) as failed " +
           "FROM FingerprintRecord f " +
           "WHERE f.lastVerifiedAt BETWEEN :startDate AND :endDate " +
           "GROUP BY DATE(f.lastVerifiedAt)")
    List<Object[]> getVerificationStatistics(
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );

    @Query("SELECT f FROM FingerprintRecord f WHERE " +
           "f.lastVerifiedAt < :threshold OR f.lastVerifiedAt IS NULL")
    Page<FingerprintRecord> findRecordsNeedingReverification(
        @Param("threshold") LocalDateTime threshold,
        Pageable pageable
    );

    Page<FingerprintRecord> findByUpdatedAtBetween(
        LocalDateTime startDate,
        LocalDateTime endDate,
        Pageable pageable
    );
}
