package com.university.universitylibrarysystem.repository;

import com.university.universitylibrarysystem.entity.Librarian;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Librarian entity operations.
 * Manages library staff data and activities.
 */
@Repository
public interface LibrarianRepository extends JpaRepository<Librarian, Long> {

    /**
     * Find librarian by email.
     * 
     * @param email Email to search for
     * @return Optional of matching librarian
     */
    Optional<Librarian> findByEmail(String email);
    Optional<Librarian> findByUsername(String username);


    /**
     * Find librarian by employee ID.
     * 
     * @param employeeId Employee ID to search for
     * @return Optional of matching librarian
     */
    Optional<Librarian> findByStaffId(String staffId);


    /**
     * Find librarians by role.
     * 
     * @param role Role to search for
     * @param pageable Pagination information
     * @return Page of matching librarians
     */
    Page<Librarian> findByRole(Librarian.Role role, Pageable pageable);

    /**
     * Find active (not terminated) librarians.
     * 
     * @param pageable Pagination information
     * @return Page of active librarians
     */
    Page<Librarian> findByTerminationDateIsNull(Pageable pageable);

    /**
     * Find librarians by department.
     * 
     * @param department Department to search for
     * @param pageable Pagination information
     * @return Page of matching librarians
     */
    Page<Librarian> findByDepartment(String department, Pageable pageable);

    /**
     * Search librarians by name (case-insensitive, partial match).
     * 
     * @param name Name to search for
     * @param pageable Pagination information
     * @return Page of matching librarians
     */
    @Query("SELECT l FROM Librarian l WHERE " +
           "LOWER(l.firstName) LIKE LOWER(CONCAT('%', :name, '%')) OR " +
           "LOWER(l.lastName) LIKE LOWER(CONCAT('%', :name, '%'))")
    Page<Librarian> searchByName(
        @Param("name") String name,
        Pageable pageable
    );

    /**
     * Find librarians with specific certifications.
     * 
     * @param certification Certification to search for
     * @param pageable Pagination information
     * @return Page of certified librarians
     */
    @Query("SELECT l FROM Librarian l WHERE " +
           ":certification MEMBER OF l.certifications")
    Page<Librarian> findByCertification(
        @Param("certification") String certification,
        Pageable pageable
    );

    /**
     * Find librarians whose certifications need renewal.
     * 
     * @param expiryThreshold Date threshold for renewal
     * @param pageable Pagination information
     * @return Page of librarians needing certification renewal
     */
    @Query("SELECT DISTINCT l FROM Librarian l JOIN l.certificationExpiryDates c " +
           "WHERE KEY(c) <= :threshold")
    Page<Librarian> findByCertificationsNearingExpiry(
        @Param("threshold") LocalDateTime expiryThreshold,
        Pageable pageable
    );

    /**
     * Get workload statistics for librarians.
     * Returns array of [librarian, borrow records processed, returns processed]
     * 
     * @param startDate Start of date range
     * @param endDate End of date range
     * @return List of workload statistics
     */
    @Query("SELECT l, " +
           "COUNT(DISTINCT b.id) as borrows, " +
           "COUNT(DISTINCT r.id) as returns " +
           "FROM Librarian l " +
           "LEFT JOIN BorrowRecord b ON b.processedBy = l " +
           "LEFT JOIN BorrowRecord r ON r.returnProcessedBy = l " +
           "WHERE b.borrowDate BETWEEN :startDate AND :endDate " +
           "OR r.returnDate BETWEEN :startDate AND :endDate " +
           "GROUP BY l")
    List<Object[]> getWorkloadStatistics(
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );

    
}