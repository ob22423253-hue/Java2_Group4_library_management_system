package com.university.universitylibrarysystem.controller;

import com.university.universitylibrarysystem.dto.AnnouncementDTO;
import com.university.universitylibrarysystem.service.AnnouncementService;
import com.university.universitylibrarysystem.util.ResponseHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/announcements")
public class AnnouncementController {

    private final AnnouncementService announcementService;

    // Librarian creates announcement
    @PostMapping
    public ResponseEntity<Object> create(@RequestBody AnnouncementDTO dto) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            AnnouncementDTO created = announcementService.create(dto, auth.getName());
            return ResponseHandler.generateResponse("Announcement created", HttpStatus.CREATED, created);
        } catch (Exception e) {
            return ResponseHandler.generateResponse(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR, null);
        }
    }

    // Librarian updates announcement
    @PutMapping("/{id}")
    public ResponseEntity<Object> update(@PathVariable Long id, @RequestBody AnnouncementDTO dto) {
        try {
            AnnouncementDTO updated = announcementService.update(id, dto);
            return ResponseHandler.generateResponse("Announcement updated", HttpStatus.OK, updated);
        } catch (Exception e) {
            return ResponseHandler.generateResponse(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR, null);
        }
    }

    // Librarian soft-deletes announcement
    @DeleteMapping("/{id}")
    public ResponseEntity<Object> delete(@PathVariable Long id) {
        try {
            announcementService.delete(id);
            return ResponseHandler.generateResponse("Announcement removed", HttpStatus.OK, null);
        } catch (Exception e) {
            return ResponseHandler.generateResponse(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR, null);
        }
    }

    // Students and librarians get active announcements
    @GetMapping
    public ResponseEntity<Object> getActive() {
        try {
            return ResponseHandler.generateResponse("Active announcements", HttpStatus.OK, announcementService.getActive());
        } catch (Exception e) {
            return ResponseHandler.generateResponse(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR, null);
        }
    }

    // Librarian gets all (including inactive)
    @GetMapping("/all")
    public ResponseEntity<Object> getAll() {
        try {
            return ResponseHandler.generateResponse("All announcements", HttpStatus.OK, announcementService.getAll());
        } catch (Exception e) {
            return ResponseHandler.generateResponse(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR, null);
        }
    }
}