package com.university.universitylibrarysystem.repository;

import com.university.universitylibrarysystem.entity.ScanRecord;
import com.university.universitylibrarysystem.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ScanRecordRepository extends JpaRepository<ScanRecord, Long> {

    List<ScanRecord> findByStudentOrderByScanTimeDesc(Student student);

    @Query("SELECT r FROM ScanRecord r WHERE r.scanTime = (SELECT MAX(r2.scanTime) FROM ScanRecord r2 WHERE r2.student = r.student)")
    List<ScanRecord> findLatestPerStudent();

    @Query("SELECT r FROM ScanRecord r WHERE r.student = :student ORDER BY r.scanTime DESC")
    List<ScanRecord> findLatestForStudent(@Param("student") Student student);
}
