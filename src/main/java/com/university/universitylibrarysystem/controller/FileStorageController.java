package com.university.universitylibrarysystem.controller;

import com.university.universitylibrarysystem.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

/**
 * REST controller for file upload/download.
 * Used for uploading student/librarian photos, reports, etc.
 */
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/files")
public class FileStorageController {

    private final FileStorageService storageService;

    @PostMapping("/upload/{category}")
    public ResponseEntity<String> uploadFile(
            @PathVariable String category,
            @RequestParam("file") MultipartFile file) {
        try {
            String path = storageService.storeFile(file, category);
            return ResponseEntity.ok("File stored at: " + path);
        } catch (Exception e) {
            log.error("File upload failed", e);
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @GetMapping("/download")
    public ResponseEntity<Resource> downloadFile(@RequestParam String path) {
        Resource resource = storageService.loadFile(path);

        String filename = URLEncoder.encode(resource.getFilename(), StandardCharsets.UTF_8);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .body(resource);
    }
}
