-- V2__student_major_minor.sql
CREATE TABLE IF NOT EXISTS student_major_minor (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    major_department_id BIGINT NOT NULL,
    minor_department_id BIGINT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (major_department_id) REFERENCES departments(id) ON DELETE RESTRICT,
    FOREIGN KEY (minor_department_id) REFERENCES departments(id) ON DELETE SET NULL,
    INDEX idx_smm_student (student_id),
    INDEX idx_smm_major (major_department_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
