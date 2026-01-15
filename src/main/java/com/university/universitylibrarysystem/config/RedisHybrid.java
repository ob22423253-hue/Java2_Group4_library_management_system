package com.university.universitylibrarysystem.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.CacheManager;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.*;
import java.time.Duration;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.TimeUnit;

/**
 * Hybrid cache configuration that supports Redis (distributed) or Caffeine (local) caching.
 *
 * Behavior:
 * - If cache.type=redis => try to use RedisCacheManager (requires RedisConnectionFactory)
 * - If cache.type=caffeine => use CaffeineCacheManager
 * - If cache.type=auto (default) => prefer Redis when a RedisConnectionFactory is present, otherwise use Caffeine
 *
 * Configure via application.yml:
 *
 * cache:
 *   type: auto    # values: auto|redis|caffeine
 *
 * You can control per-cache TTL by editing the RedisCacheConfiguration below or creating custom beans.
 */
@Configuration
public class RedisHybrid {

    // space-separated list of caches to pre-create (adjust as needed)
    private static final List<String> DEFAULT_CACHES = Arrays.asList(
            "librarians", "students", "departments", "courses", "reports", "notifications"
    );

    @Value("${cache.type:auto}")
    private String cacheType;

    @Value("${cache.caffeine.initialCapacity:100}")
    private int caffeineInitialCapacity;

    @Value("${cache.caffeine.maximumSize:1000}")
    private int caffeineMaximumSize;

    @Value("${cache.caffeine.expireAfterAccessMinutes:10}")
    private int caffeineExpireAfterAccessMinutes;

    @Value("${cache.redis.defaultTtlSeconds:600}")
    private int redisDefaultTtlSeconds;

    @Autowired(required = false)
    private RedisConnectionFactory redisConnectionFactory; // may be null if redis starter not present / not configured

    @Bean
    @Primary
    public CacheManager cacheManager() {
        String normalized = cacheType == null ? "auto" : cacheType.trim().toLowerCase();

        boolean redisRequested = "redis".equals(normalized);
        boolean auto = "auto".equals(normalized);

        boolean redisAvailable = (redisConnectionFactory != null);

        // Decision logic
        if ((redisRequested || (auto && redisAvailable)) && redisAvailable) {
            return createRedisCacheManager(redisConnectionFactory);
        }

        // fallback to caffeine
        return createCaffeineCacheManager();
    }

    /**
     * Create a RedisCacheManager with sensible defaults:
     * - JSON serialization for values (GenericJackson2JsonRedisSerializer)
     * - StringRedisSerializer for keys
     * - default TTL from property
     */
    protected CacheManager createRedisCacheManager(RedisConnectionFactory factory) {
        // key serializer
        RedisSerializer<String> keySerializer = new StringRedisSerializer();

        // value serializer (JSON)
        GenericJackson2JsonRedisSerializer valueSerializer = new GenericJackson2JsonRedisSerializer();

        RedisSerializationContext.SerializationPair<String> keyPair =
                RedisSerializationContext.SerializationPair.fromSerializer(keySerializer);

        RedisSerializationContext.SerializationPair<Object> valuePair =
                RedisSerializationContext.SerializationPair.fromSerializer(valueSerializer);

        RedisCacheConfiguration config = RedisCacheConfiguration.defaultCacheConfig()
                .serializeKeysWith(keyPair)
                .serializeValuesWith(valuePair)
                .entryTtl(Duration.ofMinutes(30) )
                .disableCachingNullValues();

        RedisCacheManager.RedisCacheManagerBuilder builder =
                RedisCacheManager.builder(factory)
                        .cacheDefaults(config)
                        .withInitialCacheConfigurations(
                                DEFAULT_CACHES.stream()
                                        .collect(java.util.stream.Collectors.toMap(
                                                name -> name,
                                                name -> config
                                        ))
                        );

        return builder.build();
    }

    /**
     * Create a CaffeineCacheManager with configured eviction and TTL behavior.
     */
    protected CacheManager createCaffeineCacheManager() {
        CaffeineCacheManager caffeineCacheManager = new CaffeineCacheManager();
        caffeineCacheManager.setCacheNames(DEFAULT_CACHES);
        caffeineCacheManager.setCaffeine(caffeineCacheBuilder());
        // By default Caffeine does not have per-entry TTL that maps exactly to Redis TTL; expireAfterAccess is used.
        return caffeineCacheManager;
    }

    protected Caffeine<Object, Object> caffeineCacheBuilder() {
        return Caffeine.newBuilder()
                .initialCapacity(caffeineInitialCapacity)
                .maximumSize(caffeineMaximumSize)
                .expireAfterAccess(caffeineExpireAfterAccessMinutes, TimeUnit.MINUTES)
                .recordStats();
    }
}
