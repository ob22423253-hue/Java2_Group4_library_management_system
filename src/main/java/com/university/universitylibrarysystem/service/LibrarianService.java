package com.university.universitylibrarysystem.service;

import com.university.universitylibrarysystem.dto.LibrarianDTO;
import com.university.universitylibrarysystem.entity.Librarian;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

/**
 * Service contract for library staff management with enhanced capabilities
 * including role management, bulk operations, and audit logging.
 */
public interface LibrarianService {

    // Core CRUD operations
    Librarian createLibrarian(LibrarianDTO librarianDTO);
    Librarian updateLibrarian(Long id, LibrarianDTO librarianDTO);
    Optional<Librarian> findById(Long id);
    void deleteLibrarian(Long id);

    // Search and query operations
    Page<Librarian> findByRole(Librarian.Role role, Pageable pageable);
    Page<Librarian> searchLibrarians(String query, Pageable pageable);
    Page<Librarian> findActiveLibrarians(Pageable pageable);

    // Role management
    Librarian updateRole(Long id, Librarian.Role newRole, String reason);
    boolean hasRole(Long id, Librarian.Role role);
    Map<Librarian.Role, Long> getRoleDistribution();

    // Bulk operations
    List<Librarian> bulkCreate(List<LibrarianDTO> librarians);
    void bulkUpdateRole(Set<Long> ids, Librarian.Role newRole, String reason);
    void bulkDeactivate(Set<Long> ids, String reason);

    // Certification management
    void addCertification(Long id, String certification, LocalDateTime expiryDate);
    void removeCertification(Long id, String certification);
    Page<Librarian> findByCertification(String certification, Pageable pageable);
    Page<Librarian> findByExpiringCertifications(LocalDateTime threshold, Pageable pageable);

    // Department management
    Page<Librarian> findByDepartment(String department, Pageable pageable);
    void updateDepartment(Long id, String newDepartment);
    Map<String, Long> getDepartmentDistribution();

    // Activity tracking
    Page<Map<String, Object>> getActivityLogs(Long librarianId, LocalDateTime start, 
                                            LocalDateTime end, Pageable pageable);
    Map<String, Long> getWorkloadStatistics(Long librarianId, LocalDateTime start, 
                                          LocalDateTime end);

    // Security and access
    void resetPassword(Long id);
    void lockAccount(Long id, String reason);
    void unlockAccount(Long id, String reason);
    boolean isAccountLocked(Long id);
}