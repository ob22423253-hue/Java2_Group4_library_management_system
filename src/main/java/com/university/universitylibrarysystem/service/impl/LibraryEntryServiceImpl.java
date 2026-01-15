package com.university.universitylibrarysystem.service.impl;

import com.university.universitylibrarysystem.entity.LibraryEntry;
import com.university.universitylibrarysystem.entity.Student;
import com.university.universitylibrarysystem.repository.LibraryEntryRepository;
import com.university.universitylibrarysystem.repository.StudentRepository;
import com.university.universitylibrarysystem.service.LibraryEntryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class LibraryEntryServiceImpl implements LibraryEntryService {

    private final LibraryEntryRepository entryRepository;
    private final StudentRepository studentRepository;

    @Autowired
    public LibraryEntryServiceImpl(LibraryEntryRepository entryRepository, StudentRepository studentRepository) {
        this.entryRepository = entryRepository;
        this.studentRepository = studentRepository;
    }

    @Override
    public LibraryEntry createEntry(LibraryEntry entry) {
        // Ensure student exists / refresh reference
        if (entry.getStudent() != null && entry.getStudent().getId() != null) {
            Student s = studentRepository.findById(entry.getStudent().getId()).orElse(null);
            entry.setStudent(s);
        }
        entry.setEntryTime(LocalDateTime.now());
        return entryRepository.save(entry);
    }

    @Override
    public LibraryEntry closeEntry(Long entryId, LocalDateTime exitTime, String exitCaptureRef) {
        LibraryEntry entry = entryRepository.findById(entryId)
                .orElseThrow(() -> new RuntimeException("LibraryEntry not found: " + entryId));
        if (entry.getExitTime() != null) {
            return entry; // already closed
        }
        entry.setExitTime(exitTime == null ? LocalDateTime.now() : exitTime);
        entry.setExitCaptureRef(exitCaptureRef);
        return entryRepository.save(entry);
    }

    @Override
    public List<LibraryEntry> findActiveEntriesByStudent(Student student) {
        return entryRepository.findByStudentAndExitTimeIsNull(student);
    }

    @Override
    public Page<LibraryEntry> findEntriesByStudent(Student student, Pageable pageable) {
        return entryRepository.findByStudent(student, pageable);
    }

    @Override
    public List<LibraryEntry> findEntriesBetween(LocalDateTime start, LocalDateTime end) {
        return entryRepository.findByEntryTimeBetween(start, end);
    }

    @Override
    public long countCurrentlyInLibrary() {
        return entryRepository.countStudentsCurrentlyInLibrary();
    }

    @Override
    public Optional<LibraryEntry> findById(Long id) {
        return entryRepository.findById(id);
    }
}