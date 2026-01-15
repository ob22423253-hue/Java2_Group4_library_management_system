-- V3__library_entries.sql
CREATE TABLE IF NOT EXISTS library_entries (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    entry_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    exit_time TIMESTAMP NULL,
    entry_method VARCHAR(20) NOT NULL,
    entry_capture_ref VARCHAR(255),
    exit_capture_ref VARCHAR(255),
    verified_by BIGINT NULL,
    notes VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (verified_by) REFERENCES librarians(id) ON DELETE SET NULL,
    INDEX idx_library_entries_student (student_id),
    INDEX idx_library_entries_entry_time (entry_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
