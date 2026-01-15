-- V7__cctv_file_storage.sql
CREATE TABLE IF NOT EXISTS cctv_events (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    event_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    event_type VARCHAR(50) NOT NULL,
    camera_id VARCHAR(100) NOT NULL,
    location VARCHAR(100) NOT NULL,
    capture_ref VARCHAR(255) NOT NULL,
    library_entry_id BIGINT NULL,
    student_id BIGINT NULL,
    recognition_confidence INT,
    security_flags VARCHAR(200),
    needs_review BOOLEAN DEFAULT FALSE,
    reviewed_by BIGINT NULL,
    review_time TIMESTAMP NULL,
    description VARCHAR(500),
    review_notes VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (library_entry_id) REFERENCES library_entries(id) ON DELETE SET NULL,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE SET NULL,
    FOREIGN KEY (reviewed_by) REFERENCES librarians(id) ON DELETE SET NULL,
    INDEX idx_cctv_library_entry (library_entry_id),
    INDEX idx_cctv_student (student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS file_storage (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    content_type VARCHAR(100),
    size BIGINT,
    storage_path VARCHAR(1024),
    uploaded_by BIGINT NULL,
    uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (uploaded_by) REFERENCES librarians(id) ON DELETE SET NULL,
    INDEX idx_file_uploaded_by (uploaded_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
