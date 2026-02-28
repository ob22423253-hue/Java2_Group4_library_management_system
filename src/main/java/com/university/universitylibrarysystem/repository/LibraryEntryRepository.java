package com.university.universitylibrarysystem.repository;

import com.university.universitylibrarysystem.entity.LibraryEntry;
import com.university.universitylibrarysystem.entity.Student;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface LibraryEntryRepository extends JpaRepository<LibraryEntry, Long> {

    List<LibraryEntry> findByStudentAndExitTimeIsNull(Student student);

    Page<LibraryEntry> findByStudent(Student student, Pageable pageable);

    List<LibraryEntry> findByEntryTimeBetween(LocalDateTime startTime, LocalDateTime endTime);

    @Query("SELECT COUNT(DISTINCT e.student) FROM LibraryEntry e WHERE e.exitTime IS NULL")
    long countStudentsCurrentlyInLibrary();

    @Query("SELECT DATE(e.entryTime) as date, " +
           "COUNT(e.id) as entries, " +
           "COUNT(e.exitTime) as exits " +
           "FROM LibraryEntry e " +
           "WHERE e.entryTime BETWEEN :startDate AND :endDate " +
           "GROUP BY DATE(e.entryTime)")
    List<Object[]> getEntryStatistics(
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );

    @Query("SELECT e FROM LibraryEntry e WHERE " +
           "e.entryCaptureRef IS NOT NULL OR e.exitCaptureRef IS NOT NULL")
    Page<LibraryEntry> findEntriesWithCCTVCaptures(Pageable pageable);

    Page<LibraryEntry> findByEntryMethod(
        LibraryEntry.EntryMethod entryMethod,
        Pageable pageable
    );

    /**
     * Fetch all library entries with student data eagerly loaded.
     * Prevents lazy loading errors when accessing student fields outside session.
     */
    @Query("SELECT e FROM LibraryEntry e JOIN FETCH e.student")
    List<LibraryEntry> findAllWithStudent();
}