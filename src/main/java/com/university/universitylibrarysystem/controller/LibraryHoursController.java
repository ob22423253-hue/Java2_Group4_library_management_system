package com.university.universitylibrarysystem.controller;

import com.university.universitylibrarysystem.dto.LibraryHoursDTO;
import com.university.universitylibrarysystem.dto.LibraryStatusDTO;
import com.university.universitylibrarysystem.service.LibraryHoursService;
import com.university.universitylibrarysystem.util.ResponseHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/library-hours")
public class LibraryHoursController {

    private final LibraryHoursService libraryHoursService;

    // Librarian sets hours
    @PostMapping
    public ResponseEntity<Object> saveHours(@RequestBody LibraryHoursDTO dto) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            LibraryHoursDTO saved = libraryHoursService.saveHours(dto, auth.getName());
            return ResponseHandler.generateResponse("Library hours saved", HttpStatus.OK, saved);
        } catch (Exception e) {
            return ResponseHandler.generateResponse(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR, null);
        }
    }

    // Get current configured hours (librarian or student)
    @GetMapping
    public ResponseEntity<Object> getHours() {
        try {
            LibraryHoursDTO dto = libraryHoursService.getCurrentHours();
            return ResponseHandler.generateResponse("Library hours", HttpStatus.OK, dto);
        } catch (Exception e) {
            return ResponseHandler.generateResponse(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR, null);
        }
    }

    // Public status endpoint — is library open right now?
    @GetMapping("/status")
    public ResponseEntity<Object> getStatus() {
        try {
            LibraryStatusDTO status = libraryHoursService.getLibraryStatus();
            return ResponseHandler.generateResponse("Library status", HttpStatus.OK, status);
        } catch (Exception e) {
            return ResponseHandler.generateResponse(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR, null);
        }
    }
}