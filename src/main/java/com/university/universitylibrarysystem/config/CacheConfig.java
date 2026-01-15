package com.university.universitylibrarysystem.config;

import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import com.github.benmanes.caffeine.cache.Caffeine;

import java.util.concurrent.TimeUnit;

/**
 * Global caching configuration for the University Library System.
 *
 * Provides application-level caching to improve performance for frequently
 * accessed data (e.g., librarian details, student lookups, department data).
 *
 * ⚙️ Supported cache providers:
 * - Caffeine (in-memory, thread-safe, high-performance)
 * - Redis (optional: can be plugged in later without code changes)
 *
 * To use caching, simply annotate methods with @Cacheable, @CacheEvict, or @CachePut.
 *
 * Example:
 *  @Cacheable(value = "librarians", key = "#username")
 *  public Librarian getLibrarianByUsername(String username) { ... }
 */
@Configuration
@EnableCaching
public class CacheConfig {

    /**
     * Configures the in-memory Caffeine cache manager.
     * Can later be swapped for RedisCacheManager if distributed caching is needed.
     */
    @Bean
    public CacheManager cacheManager() { // ✅ FIXED: removed <CaffeineCacheManager>
        CaffeineCacheManager cacheManager = new CaffeineCacheManager(
            "librarians", "students", "departments", "courses", "reports"
        );
        cacheManager.setCaffeine(caffeineCacheBuilder());
        return cacheManager;
    }

    /**
     * Defines the Caffeine cache behavior:
     * - Maximum 1000 entries per cache
     * - Expire entries 10 minutes after last access
     * - Record cache statistics
     */
    private Caffeine<Object, Object> caffeineCacheBuilder() {
        return Caffeine.newBuilder()
                .initialCapacity(100)
                .maximumSize(1000)
                .expireAfterAccess(10, TimeUnit.MINUTES)
                .recordStats();
    }
}
