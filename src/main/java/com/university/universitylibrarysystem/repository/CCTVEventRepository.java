package com.university.universitylibrarysystem.repository;

import com.university.universitylibrarysystem.entity.CCTVEvent;
import com.university.universitylibrarysystem.entity.LibraryEntry;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository interface for CCTVEvent entity operations.
 * Manages surveillance footage and event tracking.
 */
@Repository
public interface CCTVEventRepository extends JpaRepository<CCTVEvent, Long> {

    /**
     * Find events by their type.
     * 
     * @param eventType Type of event to search for
     * @param pageable Pagination information
     * @return Page of matching events
     */
    Page<CCTVEvent> findByEventType(CCTVEvent.EventType eventType, Pageable pageable);

    /**
     * Find events within a time range.
     * 
     * @param startTime Start of time range
     * @param endTime End of time range
     * @param pageable Pagination information
     * @return Page of events within range
     */
    Page<CCTVEvent> findByEventTimeBetween(
        LocalDateTime startTime,
        LocalDateTime endTime,
        Pageable pageable
    );

    /**
     * Find events by camera location.
     * 
     * @param location Camera location identifier
     * @param pageable Pagination information
     * @return Page of events from location
     */
    Page<CCTVEvent> findByLocation(String location, Pageable pageable);

    /**
     * Find events associated with a library entry.
     * 
     * @param entry The library entry to find events for
     * @return List of associated events
     */
    List<CCTVEvent> findByLibraryEntry(LibraryEntry entry);

    /**
     * Find events marked for review.
     * 
     * @param pageable Pagination information
     * @return Page of events needing review
     */
    Page<CCTVEvent> findByNeedsReviewTrue(Pageable pageable);

    /**
     * Get event statistics by type for a date range.
     * Returns array of [event type, count]
     * 
     * @param startDate Start of date range
     * @param endDate End of date range
     * @return List of event type counts
     */
    @Query("SELECT c.eventType, COUNT(c) " +
        "FROM CCTVEvent c " +
        "WHERE c.eventTime BETWEEN :startDate AND :endDate " +
           "GROUP BY c.eventType")
    List<Object[]> getEventStatistics(
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );

    /**
     * Find events by multiple criteria.
     * 
     * @param eventType Optional event type filter
     * @param location Optional camera location filter
     * @param needsReview Optional review status filter
     * @param startTime Start of time range
     * @param endTime End of time range
     * @param pageable Pagination information
     * @return Page of matching events
     */
    @Query("SELECT c FROM CCTVEvent c WHERE " +
           "(:eventType IS NULL OR c.eventType = :eventType) " +
        "AND (:location IS NULL OR c.location = :location) " +
           "AND (:needsReview IS NULL OR c.needsReview = :needsReview) " +
        "AND c.eventTime BETWEEN :startTime AND :endTime")
    Page<CCTVEvent> searchEvents(
        @Param("eventType") CCTVEvent.EventType eventType,
        @Param("location") String location,
        @Param("needsReview") Boolean needsReview,
        @Param("startTime") LocalDateTime startTime,
        @Param("endTime") LocalDateTime endTime,
        Pageable pageable
    );

    /**
     * Find high-priority events requiring immediate attention.
     * 
     * @param currentTime Current timestamp for recency check
     * @param pageable Pagination information
     * @return Page of high-priority events
     */
    @Query("SELECT c FROM CCTVEvent c WHERE " +
           "c.needsReview = true " +
           "AND c.eventType IN ('SUSPICIOUS_ACTIVITY', 'EMERGENCY_EXIT_USED', 'RESTRICTED_AREA_ACCESS') " +
           "AND c.eventTime >= :currentTime")
    Page<CCTVEvent> findHighPriorityEvents(
        @Param("currentTime") LocalDateTime currentTime,
        Pageable pageable
    );
    // Repository class end
}