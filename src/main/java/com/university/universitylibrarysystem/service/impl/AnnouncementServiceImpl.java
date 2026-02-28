package com.university.universitylibrarysystem.service.impl;

import com.university.universitylibrarysystem.dto.AnnouncementDTO;
import com.university.universitylibrarysystem.entity.Announcement;
import com.university.universitylibrarysystem.entity.Librarian;
import com.university.universitylibrarysystem.repository.AnnouncementRepository;
import com.university.universitylibrarysystem.repository.LibrarianRepository;
import com.university.universitylibrarysystem.service.AnnouncementService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnnouncementServiceImpl implements AnnouncementService {

    private final AnnouncementRepository announcementRepository;
    private final LibrarianRepository librarianRepository;

    @Override
    @Transactional
    public AnnouncementDTO create(AnnouncementDTO dto, String librarianUsername) {
        Librarian librarian = librarianRepository.findByUsername(librarianUsername)
                .orElseThrow(() -> new RuntimeException("Librarian not found: " + librarianUsername));

        Announcement a = new Announcement();
        a.setLibrarian(librarian);
        a.setTitle(dto.getTitle());
        a.setContent(dto.getContent());
        a.setActive(true);
        a.setExpiresAt(dto.getExpiresAt());

        return toDTO(announcementRepository.save(a));
    }

    @Override
    @Transactional
    public AnnouncementDTO update(Long id, AnnouncementDTO dto) {
        Announcement a = announcementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Announcement not found: " + id));
        a.setTitle(dto.getTitle());
        a.setContent(dto.getContent());
        a.setActive(dto.isActive());
        a.setExpiresAt(dto.getExpiresAt());
        return toDTO(announcementRepository.save(a));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Announcement a = announcementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Announcement not found: " + id));
        a.setActive(false);
        announcementRepository.save(a);
    }

    @Override
    public List<AnnouncementDTO> getActive() {
    LocalDateTime now = LocalDateTime.now();
    return announcementRepository.findActiveNotExpired(now)
            .stream().map(this::toDTO).collect(Collectors.toList());
}

    @Override
    public List<AnnouncementDTO> getAll() {
        return announcementRepository.findByActiveTrueOrderByCreatedAtDesc()
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    private AnnouncementDTO toDTO(Announcement a) {
        AnnouncementDTO dto = new AnnouncementDTO();
        dto.setId(a.getId());
        dto.setTitle(a.getTitle());
        dto.setContent(a.getContent());
        dto.setActive(a.isActive());
        dto.setCreatedAt(a.getCreatedAt());
        dto.setExpiresAt(a.getExpiresAt());
        return dto;
    }
}