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

/**
 * Repository interface for LibraryEntry entity operations.
 * Handles tracking of student entry/exit events and CCTV captures.
 */
@Repository
public interface LibraryEntryRepository extends JpaRepository<LibraryEntry, Long> {

    /**
     * Find current library entry (no exit time) for a student.
     * 
     * @param student The student to check
     * @return List of active entries (should normally be 0 or 1)
     */
    List<LibraryEntry> findByStudentAndExitTimeIsNull(Student student);

    /**
     * Find all entries for a specific student.
     * Results are pageable for large datasets.
     * 
     * @param student The student whose entries to find
     * @param pageable Pagination information
     * @return Page of library entries
     */
    Page<LibraryEntry> findByStudent(Student student, Pageable pageable);

    /**
     * Find entries within a date range.
     * 
     * @param startTime Start of the date range
     * @param endTime End of the date range
     * @return List of entries within range
     */
    List<LibraryEntry> findByEntryTimeBetween(LocalDateTime startTime, LocalDateTime endTime);

    /**
     * Count number of students currently in library.
     * 
     * @return Number of students with no exit time
     */
    @Query("SELECT COUNT(DISTINCT e.student) FROM LibraryEntry e WHERE e.exitTime IS NULL")
    long countStudentsCurrentlyInLibrary();

    /**
     * Get entry statistics for a date range.
     * Returns array of [date, entry count, exit count]
     * 
     * @param startDate Start of the date range
     * @param endDate End of the date range
     * @return List of daily statistics
     */
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

    /**
     * Find entries that have associated CCTV captures.
     * 
     * @param pageable Pagination information
     * @return Page of entries with CCTV data
     */
    @Query("SELECT e FROM LibraryEntry e WHERE " +
           "e.entryCaptureRef IS NOT NULL OR e.exitCaptureRef IS NOT NULL")
    Page<LibraryEntry> findEntriesWithCCTVCaptures(Pageable pageable);

    /**
     * Find all entries by verification method.
     * 
     * @param entryMethod The method used (RFID, FINGERPRINT, etc.)
     * @param pageable Pagination information
     * @return Page of matching entries
     */
    Page<LibraryEntry> findByEntryMethod(
        LibraryEntry.EntryMethod entryMethod, 
        Pageable pageable
    );
}