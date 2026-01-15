-- V5__fingerprint_records.sql
CREATE TABLE IF NOT EXISTS fingerprint_records (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL UNIQUE,
    template_data LONGBLOB NOT NULL,
    template_hash VARCHAR(255) NOT NULL,
    finger_position VARCHAR(50) NOT NULL,
    quality_score INT,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    last_verified_at TIMESTAMP NULL,
    consent_date TIMESTAMP NOT NULL,
    retention_end_date TIMESTAMP NULL,
    enrolled_by BIGINT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    last_updated_at TIMESTAMP NULL,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (enrolled_by) REFERENCES librarians(id) ON DELETE SET NULL,
    INDEX idx_fingerprint_student (student_id),
    INDEX idx_fingerprint_verified (is_verified),
    INDEX idx_fingerprint_last_verified (last_verified_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
