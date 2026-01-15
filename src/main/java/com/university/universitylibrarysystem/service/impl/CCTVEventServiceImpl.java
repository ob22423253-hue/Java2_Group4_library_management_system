package com.university.universitylibrarysystem.service.impl;

import com.university.universitylibrarysystem.dto.CCTVEventDTO;
import com.university.universitylibrarysystem.entity.CCTVEvent;
import com.university.universitylibrarysystem.entity.LibraryEntry;
import com.university.universitylibrarysystem.repository.CCTVEventRepository;
import com.university.universitylibrarysystem.repository.LibraryEntryRepository;
import com.university.universitylibrarysystem.service.CCTVEventService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class CCTVEventServiceImpl implements CCTVEventService {

    private final CCTVEventRepository eventRepository;
    private final LibraryEntryRepository libraryEntryRepository;

    @Autowired
    public CCTVEventServiceImpl(CCTVEventRepository eventRepository,
                              LibraryEntryRepository libraryEntryRepository) {
        this.eventRepository = eventRepository;
        this.libraryEntryRepository = libraryEntryRepository;
    }

    @Override
    public CCTVEvent recordEvent(CCTVEventDTO dto) {
        CCTVEvent event = new CCTVEvent();
        updateEventFromDTO(event, dto);
        if (dto.getLibraryEntryId() != null) {
            libraryEntryRepository.findById(dto.getLibraryEntryId())
                .ifPresent(event::setLibraryEntry);
        }
        return eventRepository.save(event);
    }

    @Override
    public Optional<CCTVEvent> findById(Long id) {
        return eventRepository.findById(id);
    }

    @Override
    public void deleteEvent(Long id) {
        eventRepository.deleteById(id);
    }

    @Override
    public Page<CCTVEvent> findByEventType(CCTVEvent.EventType eventType, Pageable pageable) {
        return eventRepository.findByEventType(eventType, pageable);
    }

    @Override
    public Page<CCTVEvent> findByCameraLocation(String location, Pageable pageable) {
        return eventRepository.findByLocation(location, pageable);
    }

    @Override
    public Page<CCTVEvent> findByTimeRange(LocalDateTime start, LocalDateTime end, 
                                         Pageable pageable) {
        return eventRepository.findByEventTimeBetween(start, end, pageable);
    }

    @Override
    public Page<CCTVEvent> searchEvents(String eventType, String location,
                                      Boolean needsReview, LocalDateTime start,
                                      LocalDateTime end, Pageable pageable) {
        CCTVEvent.EventType type = eventType != null ? 
            CCTVEvent.EventType.valueOf(eventType) : null;
        return eventRepository.searchEvents(type, location, needsReview, start, end, pageable);
    }

    @Override
    @Transactional
    public List<CCTVEvent> bulkRecord(List<CCTVEventDTO> events) {
        return events.stream()
            .map(this::recordEvent)
            .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void bulkMarkReviewed(Set<Long> eventIds, String reviewNotes, String reviewedBy) {
        eventRepository.findAllById(eventIds).forEach(event -> {
            event.setNeedsReview(false);
            event.setReviewNotes(reviewNotes);
            // reviewedBy is an entity relation (Librarian); we record notes and time here
            event.setReviewNotes(reviewNotes);
            event.setReviewTime(LocalDateTime.now());
            eventRepository.save(event);
        });
    }

    @Override
    @Transactional
    public void bulkDelete(Set<Long> eventIds) {
        eventRepository.deleteAllById(eventIds);
    }

    @Override
    public CCTVEvent markAsReviewed(Long id, String notes, String reviewedBy) {
        CCTVEvent event = eventRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Event not found: " + id));
        event.setNeedsReview(false);
        event.setReviewNotes(notes);
        event.setReviewTime(LocalDateTime.now());
        return eventRepository.save(event);
    }

    @Override
    public CCTVEvent flagForReview(Long id, String reason) {
        CCTVEvent event = eventRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Event not found: " + id));
        event.setNeedsReview(true);
        event.setReviewNotes(reason);
        return eventRepository.save(event);
    }

    @Override
    public Page<CCTVEvent> findEventsNeedingReview(Pageable pageable) {
        return eventRepository.findByNeedsReviewTrue(pageable);
    }

    @Override
    public List<CCTVEvent> findByLibraryEntry(LibraryEntry entry) {
        return eventRepository.findByLibraryEntry(entry);
    }

    @Override
    public void linkToLibraryEntry(Long eventId, Long entryId) {
        CCTVEvent event = eventRepository.findById(eventId)
            .orElseThrow(() -> new RuntimeException("Event not found: " + eventId));
        LibraryEntry entry = libraryEntryRepository.findById(entryId)
            .orElseThrow(() -> new RuntimeException("Library entry not found: " + entryId));
        event.setLibraryEntry(entry);
        eventRepository.save(event);
    }

    @Override
    public Map<CCTVEvent.EventType, Long> getEventTypeDistribution(LocalDateTime start,
                                                                  LocalDateTime end) {
        List<Object[]> stats = eventRepository.getEventStatistics(start, end);
        Map<CCTVEvent.EventType, Long> distribution = new EnumMap<>(CCTVEvent.EventType.class);
        stats.forEach(stat -> distribution.put(
            (CCTVEvent.EventType) stat[0],
            (Long) stat[1]
        ));
        return distribution;
    }

    @Override
    public Map<String, Long> getLocationActivityHeatmap(LocalDateTime start,
                                                       LocalDateTime end) {
        return eventRepository.findByEventTimeBetween(start, end, Pageable.unpaged())
            .stream()
            .collect(Collectors.groupingBy(
                CCTVEvent::getLocation,
                Collectors.counting()
            ));
    }

    @Override
    public Map<Integer, Long> getHourlyEventDistribution(LocalDateTime date) {
        LocalDateTime start = date.truncatedTo(ChronoUnit.DAYS);
        LocalDateTime end = start.plusDays(1);
        
        Map<Integer, Long> hourlyDist = new HashMap<>();
        eventRepository.findByEventTimeBetween(start, end, Pageable.unpaged())
            .stream()
            .collect(Collectors.groupingBy(
                e -> e.getEventTime().getHour(),
                Collectors.counting()
            ));
        
        // Fill in empty hours
        for (int i = 0; i < 24; i++) {
            hourlyDist.putIfAbsent(i, 0L);
        }
        
        return hourlyDist;
    }

    @Override
    public List<CCTVEvent> findHighPriorityEvents(LocalDateTime since) {
        return eventRepository.findHighPriorityEvents(since, Pageable.unpaged())
            .getContent();
    }

    @Override
    public Map<String, Object> getSecurityMetrics(LocalDateTime start,
                                                LocalDateTime end) {
        Map<String, Object> metrics = new HashMap<>();
        
        // Calculate various security metrics
    metrics.put("totalEvents", eventRepository.findByEventTimeBetween(start, end, Pageable.unpaged()).getTotalElements());
    metrics.put("highPriorityEvents", eventRepository.findHighPriorityEvents(start, Pageable.unpaged()).getTotalElements());
        metrics.put("pendingReviews", eventRepository.findByNeedsReviewTrue(Pageable.unpaged()).getTotalElements());
        metrics.put("eventTypeDistribution", getEventTypeDistribution(start, end));
        
        return metrics;
    }

    @Override
    @Transactional
    public void archiveEvents(LocalDateTime before) {
        // Implementation would depend on archival strategy
        throw new UnsupportedOperationException("Archival not implemented");
    }

    @Override
    @Transactional
    public void deleteArchivedEvents(LocalDateTime before) {
        // Implementation would depend on archival strategy
        throw new UnsupportedOperationException("Archive deletion not implemented");
    }

    @Override
    public Map<String, Object> getStorageMetrics() {
        // Implementation would depend on storage monitoring capabilities
        throw new UnsupportedOperationException("Storage metrics not implemented");
    }

    @Override
    public byte[] exportEvents(LocalDateTime start, LocalDateTime end, String format) {
        // Implementation would depend on export format requirements
        throw new UnsupportedOperationException("Export not implemented");
    }

    @Override
    public String generateEventReport(LocalDateTime start, LocalDateTime end) {
        // Implementation would depend on reporting requirements
        throw new UnsupportedOperationException("Report generation not implemented");
    }

    // Helper methods
    private void updateEventFromDTO(CCTVEvent event, CCTVEventDTO dto) {
        event.setEventType(CCTVEvent.EventType.valueOf(dto.getEventType()));
        event.setLocation(dto.getCameraLocation());
        event.setDescription(dto.getDescription());
        event.setCaptureRef(dto.getCaptureRef());
        event.setNeedsReview(dto.isNeedsReview());
        event.setReviewNotes(dto.getReviewNotes());
        event.setEventTime(dto.getTimestamp() != null ? dto.getTimestamp() : LocalDateTime.now());
    }
}