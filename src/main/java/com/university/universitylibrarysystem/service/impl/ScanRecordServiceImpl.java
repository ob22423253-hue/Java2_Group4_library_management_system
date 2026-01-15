package com.university.universitylibrarysystem.service.impl;

import com.university.universitylibrarysystem.entity.ScanRecord;
import com.university.universitylibrarysystem.entity.Student;
import com.university.universitylibrarysystem.repository.ScanRecordRepository;
import com.university.universitylibrarysystem.service.ScanRecordService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ScanRecordServiceImpl implements ScanRecordService {

    private final ScanRecordRepository scanRecordRepository;

    @Override
    @Transactional
    public ScanRecord saveScan(Student student, ScanRecord.ScanType type, LocalDateTime time) {
        ScanRecord r = new ScanRecord();
        r.setStudent(student);
        r.setScanType(type == null ? ScanRecord.ScanType.ENTRY : type);
        r.setScanTime(time == null ? LocalDateTime.now() : time);
        return scanRecordRepository.save(r);
    }

    @Override
    public List<ScanRecord> getStudentsCurrentlyInside() {

        List<ScanRecord> latest = scanRecordRepository.findLatestPerStudent();
        if (latest == null) return Collections.emptyList();

        // Keep only students whose last scan is ENTRY
        return latest.stream()
                .filter(r -> r.getScanType() == ScanRecord.ScanType.ENTRY)
                .collect(Collectors.toList());
    }
}
