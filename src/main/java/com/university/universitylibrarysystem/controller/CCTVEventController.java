package com.university.universitylibrarysystem.controller;

import com.university.universitylibrarysystem.dto.CCTVEventDTO;
import com.university.universitylibrarysystem.entity.CCTVEvent;
import com.university.universitylibrarysystem.service.CCTVEventService;
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
 * REST Controller for managing CCTV surveillance events.
 * Handles event creation, review, searching, and statistics.
 *
 * Provides secured endpoints for the library security team.
 *
 * @author 
 * @version 1.0
 */
@RestController
@RequestMapping("/cctv-events")
@RequiredArgsConstructor
public class CCTVEventController {

    private final CCTVEventService cctvEventService;

    // =====================================================
    // =============== Core CRUD Endpoints =================
    // =====================================================

    /**
     * Record a new CCTV event.
     */
    @PostMapping
    public ResponseEntity<Object> recordEvent(@Valid @RequestBody CCTVEventDTO dto) {
        CCTVEvent event = cctvEventService.recordEvent(dto);
        return ResponseHandler.generateResponse(
                "CCTV event recorded successfully",
                HttpStatus.CREATED,
                eventToDTO(event)
        );
    }

    /**
     * Get event details by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Object> getEventById(@PathVariable Long id) {
        return cctvEventService.findById(id)
                .map(event -> ResponseHandler.generateResponse(
                        "Event retrieved successfully",
                        HttpStatus.OK,
                        eventToDTO(event)))
                .orElseGet(() -> ResponseHandler.generateResponse(
                        "Event not found",
                        HttpStatus.NOT_FOUND,
                        null));
    }

    /**
     * Delete a CCTV event by ID.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Object> deleteEvent(@PathVariable Long id) {
        cctvEventService.deleteEvent(id);
        return ResponseHandler.generateResponse(
                "CCTV event deleted successfully",
                HttpStatus.OK,
                null
        );
    }

    // =====================================================
    // =============== Search & Filter =====================
    // =====================================================

    /**
     * Search CCTV events by criteria.
     */
    @GetMapping("/search")
    public ResponseEntity<Object> searchEvents(
            @RequestParam(required = false) String eventType,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Boolean needsReview,
            @RequestParam(required = false) LocalDateTime start,
            @RequestParam(required = false) LocalDateTime end,
            Pageable pageable) {

        LocalDateTime startTime = start != null ? start : LocalDateTime.now().minusDays(7);
        LocalDateTime endTime = end != null ? end : LocalDateTime.now();

        Page<CCTVEvent> result = cctvEventService.searchEvents(
                eventType, location, needsReview, startTime, endTime, pageable);

        return ResponseHandler.generateResponse(
                "CCTV events retrieved successfully",
                HttpStatus.OK,
                result.map(this::eventToDTO)
        );
    }

    /**
     * Get all events needing review.
     */
    @GetMapping("/needs-review")
    public ResponseEntity<Object> getEventsNeedingReview(Pageable pageable) {
        Page<CCTVEvent> events = cctvEventService.findEventsNeedingReview(pageable);
        return ResponseHandler.generateResponse(
                "Pending CCTV reviews retrieved",
                HttpStatus.OK,
                events.map(this::eventToDTO)
        );
    }

    // =====================================================
    // =============== Review & Moderation =================
    // =====================================================

    /**
     * Mark an event as reviewed.
     */
    @PutMapping("/{id}/review")
    public ResponseEntity<Object> markAsReviewed(
            @PathVariable Long id,
            @RequestParam String notes,
            @RequestParam(required = false) String reviewedBy) {

        CCTVEvent updated = cctvEventService.markAsReviewed(id, notes, reviewedBy);
        return ResponseHandler.generateResponse(
                "CCTV event marked as reviewed",
                HttpStatus.OK,
                eventToDTO(updated)
        );
    }

    /**
     * Flag an event for staff review.
     */
    @PutMapping("/{id}/flag")
    public ResponseEntity<Object> flagForReview(
            @PathVariable Long id,
            @RequestParam String reason) {

        CCTVEvent updated = cctvEventService.flagForReview(id, reason);
        return ResponseHandler.generateResponse(
                "Event flagged for review",
                HttpStatus.OK,
                eventToDTO(updated)
        );
    }

    // =====================================================
    // =============== Statistics & Insights ===============
    // =====================================================

    /**
     * Get CCTV event statistics within a date range.
     */
    @GetMapping("/stats")
    public ResponseEntity<Object> getEventStatistics(
            @RequestParam(required = false) LocalDateTime start,
            @RequestParam(required = false) LocalDateTime end) {

        LocalDateTime startTime = start != null ? start : LocalDateTime.now().minusDays(7);
        LocalDateTime endTime = end != null ? end : LocalDateTime.now();

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("eventTypeDistribution", cctvEventService.getEventTypeDistribution(startTime, endTime));
        stats.put("locationHeatmap", cctvEventService.getLocationActivityHeatmap(startTime, endTime));
        stats.put("hourlyDistribution", cctvEventService.getHourlyEventDistribution(startTime));

        return ResponseHandler.generateResponse(
                "CCTV statistics generated successfully",
                HttpStatus.OK,
                stats
        );
    }

    /**
     * Get overall security metrics summary.
     */
    @GetMapping("/metrics")
    public ResponseEntity<Object> getSecurityMetrics(
            @RequestParam(required = false) LocalDateTime start,
            @RequestParam(required = false) LocalDateTime end) {

        LocalDateTime startTime = start != null ? start : LocalDateTime.now().minusDays(7);
        LocalDateTime endTime = end != null ? end : LocalDateTime.now();

        Map<String, Object> metrics = cctvEventService.getSecurityMetrics(startTime, endTime);
        return ResponseHandler.generateResponse(
                "Security metrics retrieved successfully",
                HttpStatus.OK,
                metrics
        );
    }

    // =====================================================
    // =============== Helper Methods ======================
    // =====================================================

    private CCTVEventDTO eventToDTO(CCTVEvent event) {
        CCTVEventDTO dto = new CCTVEventDTO();
        dto.setId(event.getId());
        dto.setEventType(event.getEventType().name());
        dto.setCameraLocation(event.getLocation());
        dto.setDescription(event.getDescription());
        dto.setCaptureRef(event.getCaptureRef());
        dto.setNeedsReview(event.isNeedsReview());
        dto.setReviewNotes(event.getReviewNotes());
        dto.setTimestamp(event.getEventTime());
        dto.setLibraryEntryId(
                event.getLibraryEntry() != null ? event.getLibraryEntry().getId() : null
        );
        return dto;
    }
}
