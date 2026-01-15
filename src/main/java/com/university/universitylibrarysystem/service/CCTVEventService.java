package com.university.universitylibrarysystem.service;

import com.university.universitylibrarysystem.dto.CCTVEventDTO;
import com.university.universitylibrarysystem.entity.CCTVEvent;
import com.university.universitylibrarysystem.entity.LibraryEntry;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

/**
 * Service contract for CCTV event management with enhanced monitoring
 * and analysis capabilities.
 */
public interface CCTVEventService {

    // Core operations
    CCTVEvent recordEvent(CCTVEventDTO eventDTO);
    Optional<CCTVEvent> findById(Long id);
    void deleteEvent(Long id);
    
    // Search and filtering
    Page<CCTVEvent> findByEventType(CCTVEvent.EventType eventType, Pageable pageable);
    Page<CCTVEvent> findByCameraLocation(String location, Pageable pageable);
    Page<CCTVEvent> findByTimeRange(LocalDateTime start, LocalDateTime end, Pageable pageable);
    
    // Advanced search
    Page<CCTVEvent> searchEvents(String eventType, String location, 
                               Boolean needsReview, LocalDateTime start,
                               LocalDateTime end, Pageable pageable);

    // Bulk operations
    List<CCTVEvent> bulkRecord(List<CCTVEventDTO> events);
    void bulkMarkReviewed(Set<Long> eventIds, String reviewNotes, String reviewedBy);
    void bulkDelete(Set<Long> eventIds);

    // Review management
    CCTVEvent markAsReviewed(Long id, String notes, String reviewedBy);
    CCTVEvent flagForReview(Long id, String reason);
    Page<CCTVEvent> findEventsNeedingReview(Pageable pageable);
    
    // Library entry association
    List<CCTVEvent> findByLibraryEntry(LibraryEntry entry);
    void linkToLibraryEntry(Long eventId, Long entryId);
    
    // Statistics and analysis
    Map<CCTVEvent.EventType, Long> getEventTypeDistribution(LocalDateTime start, 
                                                           LocalDateTime end);
    Map<String, Long> getLocationActivityHeatmap(LocalDateTime start,
                                                LocalDateTime end);
    Map<Integer, Long> getHourlyEventDistribution(LocalDateTime date);
    
    // Security monitoring
    List<CCTVEvent> findHighPriorityEvents(LocalDateTime since);
    Map<String, Object> getSecurityMetrics(LocalDateTime start,
                                         LocalDateTime end);
    
    // Storage management
    void archiveEvents(LocalDateTime before);
    void deleteArchivedEvents(LocalDateTime before);
    Map<String, Object> getStorageMetrics();
    
    // Export capabilities
    byte[] exportEvents(LocalDateTime start, LocalDateTime end, String format);
    String generateEventReport(LocalDateTime start, LocalDateTime end);
}