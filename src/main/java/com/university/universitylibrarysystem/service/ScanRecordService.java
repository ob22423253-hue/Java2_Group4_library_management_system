package com.university.universitylibrarysystem.service;

import com.university.universitylibrarysystem.entity.ScanRecord;
import com.university.universitylibrarysystem.entity.Student;

import java.time.LocalDateTime;
import java.util.List;

public interface ScanRecordService {

    ScanRecord saveScan(Student student, ScanRecord.ScanType type, LocalDateTime time);

    /**
     * Returns latest scan record per student
     * (caller decides ENTRY / EXIT filtering)
     */
    List<ScanRecord> getStudentsCurrentlyInside();
}
