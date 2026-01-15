package com.university.universitylibrarysystem.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;
import java.util.concurrent.ThreadPoolExecutor;

@Slf4j
@Configuration
@EnableAsync
public class AsyncConfig {

    /**
     * Controls whether to use a single global executor or multiple named ones.
     * Example (application.yml):
     * async:
     *   mode: multi   # options: single | multi
     */
    @Value("${async.mode:single}")
    private String asyncMode;

    @Bean(name = "defaultExecutor")
    public Executor defaultExecutor() {
        if ("multi".equalsIgnoreCase(asyncMode)) {
            log.info("Async mode: MULTI — using dedicated executors for reports/notifications");
        } else {
            log.info("Async mode: SINGLE — using shared global executor");
        }

        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(8);
        executor.setMaxPoolSize(16);
        executor.setQueueCapacity(200);
        executor.setThreadNamePrefix("AsyncExecutor-");
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        executor.initialize();
        return executor;
    }

    /**
     * Dedicated executor for reports (only used in multi mode)
     */
    @Bean(name = "reportExecutor")
    public Executor reportExecutor() {
        if (!"multi".equalsIgnoreCase(asyncMode)) {
            return defaultExecutor();
        }
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(4);
        executor.setMaxPoolSize(8);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("ReportExecutor-");
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        executor.initialize();
        log.info("ReportExecutor initialized");
        return executor;
    }

    /**
     * Dedicated executor for notifications (only used in multi mode)
     */
    @Bean(name = "notificationExecutor")
    public Executor notificationExecutor() {
        if (!"multi".equalsIgnoreCase(asyncMode)) {
            return defaultExecutor();
        }
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(2);
        executor.setMaxPoolSize(4);
        executor.setQueueCapacity(50);
        executor.setThreadNamePrefix("NotificationExecutor-");
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        executor.initialize();
        log.info("NotificationExecutor initialized");
        return executor;
    }
}
