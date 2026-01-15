package com.university.universitylibrarysystem.service.impl;

import com.university.universitylibrarysystem.dto.LibrarianDTO;
import com.university.universitylibrarysystem.entity.Librarian;
import com.university.universitylibrarysystem.repository.LibrarianRepository;
import com.university.universitylibrarysystem.service.LibrarianService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class LibrarianServiceImpl implements LibrarianService {

    private final LibrarianRepository librarianRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public LibrarianServiceImpl(LibrarianRepository librarianRepository, 
                              PasswordEncoder passwordEncoder) {
        this.librarianRepository = librarianRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public Librarian createLibrarian(LibrarianDTO dto) {
        validateLibrarianDTO(dto);
        Librarian librarian = new Librarian();
        updateLibrarianFromDTO(librarian, dto);
        // Set default password - should be changed on first login
        librarian.setPasswordHash(passwordEncoder.encode("changeme"));
        return librarianRepository.save(librarian);
    }

    @Override
    public Librarian updateLibrarian(Long id, LibrarianDTO dto) {
        Librarian existing = librarianRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Librarian not found: " + id));
        validateLibrarianDTO(dto);
        updateLibrarianFromDTO(existing, dto);
        return librarianRepository.save(existing);
    }

    @Override
    public Optional<Librarian> findById(Long id) {
        return librarianRepository.findById(id);
    }

    @Override
    public void deleteLibrarian(Long id) {
        Librarian librarian = librarianRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Librarian not found: " + id));
        // Soft delete by setting termination date
        librarian.setTerminationDate(LocalDateTime.now());
        librarianRepository.save(librarian);
    }

    @Override
    public Page<Librarian> findByRole(Librarian.Role role, Pageable pageable) {
        return librarianRepository.findByRole(role, pageable);
    }

    @Override
    public Page<Librarian> searchLibrarians(String query, Pageable pageable) {
        return librarianRepository.searchByName(query, pageable);
    }

    @Override
    public Page<Librarian> findActiveLibrarians(Pageable pageable) {
        return librarianRepository.findByTerminationDateIsNull(pageable);
    }

    @Override
    public Librarian updateRole(Long id, Librarian.Role newRole, String reason) {
        Librarian librarian = librarianRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Librarian not found: " + id));
        librarian.setRole(newRole);
        // Audit log could be added here
        return librarianRepository.save(librarian);
    }

    @Override
    public boolean hasRole(Long id, Librarian.Role role) {
        return librarianRepository.findById(id)
            .map(l -> role.equals(l.getRole()))
            .orElse(false);
    }

    @Override
    public Map<Librarian.Role, Long> getRoleDistribution() {
        return librarianRepository.findAll().stream()
            .collect(Collectors.groupingBy(
                Librarian::getRole,
                Collectors.counting()
            ));
    }

    @Override
    @Transactional
    public List<Librarian> bulkCreate(List<LibrarianDTO> librarians) {
        return librarians.stream()
            .map(this::createLibrarian)
            .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void bulkUpdateRole(Set<Long> ids, Librarian.Role newRole, String reason) {
        librarianRepository.findAllById(ids)
            .forEach(l -> updateRole(l.getId(), newRole, reason));
    }

    @Override
    @Transactional
    public void bulkDeactivate(Set<Long> ids, String reason) {
        LocalDateTime now = LocalDateTime.now();
        librarianRepository.findAllById(ids)
            .forEach(l -> {
                l.setTerminationDate(now);
                l.setActive(false);
                // Audit log could be added here
                librarianRepository.save(l);
            });
    }

    @Override
    public void addCertification(Long id, String certification, LocalDateTime expiryDate) {
        Librarian librarian = librarianRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Librarian not found: " + id));
        librarian.getCertifications().add(certification);
        librarian.getCertificationExpiryDates().put(certification, expiryDate);
        librarianRepository.save(librarian);
    }

    @Override
    public void removeCertification(Long id, String certification) {
        Librarian librarian = librarianRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Librarian not found: " + id));
        librarian.getCertifications().remove(certification);
        librarian.getCertificationExpiryDates().remove(certification);
        librarianRepository.save(librarian);
    }

    @Override
    public Page<Librarian> findByCertification(String certification, Pageable pageable) {
        return librarianRepository.findByCertification(certification, pageable);
    }

    @Override
    public Page<Librarian> findByExpiringCertifications(LocalDateTime threshold, Pageable pageable) {
        return librarianRepository.findByCertificationsNearingExpiry(threshold, pageable);
    }

    @Override
    public Page<Librarian> findByDepartment(String department, Pageable pageable) {
        return librarianRepository.findByDepartment(department, pageable);
    }

    @Override
    public void updateDepartment(Long id, String newDepartment) {
        Librarian librarian = librarianRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Librarian not found: " + id));
        librarian.setDepartment(newDepartment);
        librarianRepository.save(librarian);
    }

    @Override
    public Map<String, Long> getDepartmentDistribution() {
        return librarianRepository.findAll().stream()
            .collect(Collectors.groupingBy(
                Librarian::getDepartment,
                Collectors.counting()
            ));
    }

    @Override
    public Page<Map<String, Object>> getActivityLogs(Long librarianId, 
                                                    LocalDateTime start,
                                                    LocalDateTime end, 
                                                    Pageable pageable) {
        // Implementation would depend on audit logging system
        throw new UnsupportedOperationException("Audit logging not implemented");
    }

    @Override
    public Map<String, Long> getWorkloadStatistics(Long librarianId,
                                                  LocalDateTime start,
                                                  LocalDateTime end) {
        return librarianRepository.getWorkloadStatistics(start, end).stream()
            .filter(stats -> stats[0] instanceof Librarian &&
                           ((Librarian) stats[0]).getId().equals(librarianId))
            .findFirst()
            .map(stats -> {
                Map<String, Long> workload = new HashMap<>();
                workload.put("borrows", (Long) stats[1]);
                workload.put("returns", (Long) stats[2]);
                return workload;
            })
            .orElse(new HashMap<>());
    }

    @Override
    public void resetPassword(Long id) {
        Librarian librarian = librarianRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Librarian not found: " + id));
        librarian.setPasswordHash(passwordEncoder.encode("changeme"));
        librarian.setPasswordResetRequired(true);
        librarianRepository.save(librarian);
    }

    @Override
    public void lockAccount(Long id, String reason) {
        Librarian librarian = librarianRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Librarian not found: " + id));
        librarian.setActive(false);
        librarian.setLockReason(reason);
        librarianRepository.save(librarian);
    }

    @Override
    public void unlockAccount(Long id, String reason) {
        Librarian librarian = librarianRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Librarian not found: " + id));
        librarian.setActive(true);
        librarian.setLockReason(null);
        librarianRepository.save(librarian);
    }

    @Override
    public boolean isAccountLocked(Long id) {
        return librarianRepository.findById(id)
            .map(l -> !l.isActive())
            .orElse(false);
    }

    // Helper methods
    private void validateLibrarianDTO(LibrarianDTO dto) {
        if (dto.getEmail() != null) {
            librarianRepository.findByEmail(dto.getEmail())
                .ifPresent(l -> {
                    if (!l.getId().equals(dto.getId())) {
                        throw new RuntimeException("Email already in use");
                    }
                });
        }
    }

    private void updateLibrarianFromDTO(Librarian librarian, LibrarianDTO dto) {
        librarian.setStaffId(dto.getStaffId());
        librarian.setUsername(dto.getUsername());
        librarian.setFirstName(dto.getFirstName());
        librarian.setLastName(dto.getLastName());
        librarian.setEmail(dto.getEmail());
        librarian.setRole(Librarian.Role.valueOf(dto.getRole()));
        librarian.setPhotoUrl(dto.getPhotoUrl());
        librarian.setDepartment(dto.getDepartment());
        if (dto.getCertifications() != null) {
            librarian.setCertifications(new HashSet<>(dto.getCertifications()));
        }
    }
}