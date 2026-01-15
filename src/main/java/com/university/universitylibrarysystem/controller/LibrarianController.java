package com.university.universitylibrarysystem.controller;

import com.university.universitylibrarysystem.dto.LibrarianDTO;
import com.university.universitylibrarysystem.entity.Librarian;
import com.university.universitylibrarysystem.service.LibrarianService;
import com.university.universitylibrarysystem.util.ResponseHandler;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

/**
 * REST controller for managing library staff (librarians).
 * 
 * Provides endpoints for:
 * - CRUD operations
 * - Role & department management
 * - Certification tracking
 * - Bulk operations
 * - Account locking/unlocking
 * - Metrics and workload stats
 *
 * @author 
 * @version 1.0
 */
@RestController
@RequestMapping("/librarians")
@RequiredArgsConstructor
public class LibrarianController {

    private final LibrarianService librarianService;

    // ---------------------- BASIC CRUD ----------------------

    @PostMapping
    public ResponseEntity<Object> createLibrarian(@Valid @RequestBody LibrarianDTO dto) {
        Librarian saved = librarianService.createLibrarian(dto);
        return ResponseHandler.generateResponse("Librarian created successfully", HttpStatus.CREATED, saved);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Object> getLibrarianById(@PathVariable Long id) {
        return librarianService.findById(id)
                .map(l -> ResponseHandler.generateResponse("Librarian found", HttpStatus.OK, l))
                .orElse(ResponseHandler.generateResponse("Librarian not found", HttpStatus.NOT_FOUND, null));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Object> updateLibrarian(@PathVariable Long id, @Valid @RequestBody LibrarianDTO dto) {
        Librarian updated = librarianService.updateLibrarian(id, dto);
        return ResponseHandler.generateResponse("Librarian updated successfully", HttpStatus.OK, updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Object> deleteLibrarian(@PathVariable Long id) {
        librarianService.deleteLibrarian(id);
        return ResponseHandler.generateResponse("Librarian deleted (soft delete)", HttpStatus.OK, null);
    }

    // ---------------------- QUERY & FILTER ----------------------

    @GetMapping
    public ResponseEntity<Object> getAllLibrarians(Pageable pageable) {
        Page<Librarian> librarians = librarianService.findActiveLibrarians(pageable);
        return ResponseHandler.generateResponse("Active librarians retrieved", HttpStatus.OK, librarians);
    }

    @GetMapping("/search")
    public ResponseEntity<Object> searchLibrarians(
            @RequestParam(required = false) String query,
            Pageable pageable) {
        Page<Librarian> results = librarianService.searchLibrarians(query, pageable);
        return ResponseHandler.generateResponse("Search results", HttpStatus.OK, results);
    }

    @GetMapping("/role/{role}")
    public ResponseEntity<Object> getByRole(@PathVariable Librarian.Role role, Pageable pageable) {
        Page<Librarian> page = librarianService.findByRole(role, pageable);
        return ResponseHandler.generateResponse("Librarians by role retrieved", HttpStatus.OK, page);
    }

    @GetMapping("/department/{department}")
    public ResponseEntity<Object> getByDepartment(@PathVariable String department, Pageable pageable) {
        Page<Librarian> page = librarianService.findByDepartment(department, pageable);
        return ResponseHandler.generateResponse("Librarians by department retrieved", HttpStatus.OK, page);
    }

    // ---------------------- ROLE & DEPARTMENT ----------------------

    @PatchMapping("/{id}/role")
    public ResponseEntity<Object> updateRole(
            @PathVariable Long id,
            @RequestParam Librarian.Role newRole,
            @RequestParam(required = false) String reason) {
        Librarian librarian = librarianService.updateRole(id, newRole, reason);
        return ResponseHandler.generateResponse("Librarian role updated", HttpStatus.OK, librarian);
    }

    @PatchMapping("/{id}/department")
    public ResponseEntity<Object> updateDepartment(
            @PathVariable Long id,
            @RequestParam String department) {
        librarianService.updateDepartment(id, department);
        return ResponseHandler.generateResponse("Department updated successfully", HttpStatus.OK, null);
    }

    // ---------------------- CERTIFICATION ----------------------

    @PostMapping("/{id}/certifications")
    public ResponseEntity<Object> addCertification(
            @PathVariable Long id,
            @RequestParam String certification,
            @RequestParam(required = false) LocalDateTime expiryDate) {
        librarianService.addCertification(id, certification, expiryDate);
        return ResponseHandler.generateResponse("Certification added successfully", HttpStatus.CREATED, null);
    }

    @DeleteMapping("/{id}/certifications")
    public ResponseEntity<Object> removeCertification(
            @PathVariable Long id,
            @RequestParam String certification) {
        librarianService.removeCertification(id, certification);
        return ResponseHandler.generateResponse("Certification removed successfully", HttpStatus.OK, null);
    }

    @GetMapping("/certifications/{certification}")
    public ResponseEntity<Object> getByCertification(
            @PathVariable String certification,
            Pageable pageable) {
        Page<Librarian> page = librarianService.findByCertification(certification, pageable);
        return ResponseHandler.generateResponse("Librarians with certification retrieved", HttpStatus.OK, page);
    }

    // ---------------------- ACCOUNT MANAGEMENT ----------------------

    @PatchMapping("/{id}/lock")
    public ResponseEntity<Object> lockAccount(
            @PathVariable Long id,
            @RequestParam(required = false) String reason) {
        librarianService.lockAccount(id, reason);
        return ResponseHandler.generateResponse("Account locked successfully", HttpStatus.OK, null);
    }

    @PatchMapping("/{id}/unlock")
    public ResponseEntity<Object> unlockAccount(
            @PathVariable Long id,
            @RequestParam(required = false) String reason) {
        librarianService.unlockAccount(id, reason);
        return ResponseHandler.generateResponse("Account unlocked successfully", HttpStatus.OK, null);
    }

    @PostMapping("/{id}/reset-password")
    public ResponseEntity<Object> resetPassword(@PathVariable Long id) {
        librarianService.resetPassword(id);
        return ResponseHandler.generateResponse("Password reset successfully", HttpStatus.OK, null);
    }

    // ---------------------- BULK OPERATIONS ----------------------

    @PostMapping("/bulk/create")
    public ResponseEntity<Object> bulkCreate(@RequestBody List<@Valid LibrarianDTO> librarians) {
        List<Librarian> created = librarianService.bulkCreate(librarians);
        return ResponseHandler.generateResponse("Bulk librarian creation successful", HttpStatus.CREATED, created);
    }

    @PatchMapping("/bulk/role")
    public ResponseEntity<Object> bulkUpdateRole(
            @RequestBody Set<Long> ids,
            @RequestParam Librarian.Role newRole,
            @RequestParam(required = false) String reason) {
        librarianService.bulkUpdateRole(ids, newRole, reason);
        return ResponseHandler.generateResponse("Bulk role update successful", HttpStatus.OK, null);
    }

    @PatchMapping("/bulk/deactivate")
    public ResponseEntity<Object> bulkDeactivate(
            @RequestBody Set<Long> ids,
            @RequestParam(required = false) String reason) {
        librarianService.bulkDeactivate(ids, reason);
        return ResponseHandler.generateResponse("Bulk deactivation successful", HttpStatus.OK, null);
    }

    // ---------------------- METRICS & STATS ----------------------

    @GetMapping("/metrics/roles")
    public ResponseEntity<Object> getRoleDistribution() {
        Map<Librarian.Role, Long> metrics = librarianService.getRoleDistribution();
        return ResponseHandler.generateResponse("Role distribution metrics", HttpStatus.OK, metrics);
    }

    @GetMapping("/metrics/departments")
    public ResponseEntity<Object> getDepartmentDistribution() {
        Map<String, Long> metrics = librarianService.getDepartmentDistribution();
        return ResponseHandler.generateResponse("Department distribution metrics", HttpStatus.OK, metrics);
    }

    @GetMapping("/{id}/workload")
    public ResponseEntity<Object> getWorkloadStats(
            @PathVariable Long id,
            @RequestParam LocalDateTime start,
            @RequestParam LocalDateTime end) {
        Map<String, Long> stats = librarianService.getWorkloadStatistics(id, start, end);
        return ResponseHandler.generateResponse("Workload statistics retrieved", HttpStatus.OK, stats);
    }

    // ---------------------- UTILITY ----------------------

    @GetMapping("/{id}/status")
    public ResponseEntity<Object> isAccountLocked(@PathVariable Long id) {
        boolean locked = librarianService.isAccountLocked(id);
        return ResponseHandler.generateResponse("Account status retrieved", HttpStatus.OK, Map.of("locked", locked));
    }
}
