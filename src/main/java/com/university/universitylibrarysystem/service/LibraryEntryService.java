package com.university.universitylibrarysystem.service;

import com.university.universitylibrarysystem.entity.LibraryEntry;
import com.university.universitylibrarysystem.entity.Student;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Service contract for managing library entry/exit events.
 */
public interface LibraryEntryService {

    LibraryEntry createEntry(LibraryEntry entry);

    LibraryEntry closeEntry(Long entryId, LocalDateTime exitTime, String exitCaptureRef);

    List<LibraryEntry> findActiveEntriesByStudent(Student student);

    Page<LibraryEntry> findEntriesByStudent(Student student, Pageable pageable);

    List<LibraryEntry> findEntriesBetween(LocalDateTime start, LocalDateTime end);

    long countCurrentlyInLibrary();

    Optional<LibraryEntry> findById(Long id);
}