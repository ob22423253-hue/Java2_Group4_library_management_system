-- V8__add_student_major_minor_year.sql
ALTER TABLE students
    ADD COLUMN major VARCHAR(100) NULL,
    ADD COLUMN minor_subject VARCHAR(100) NULL,
    ADD COLUMN year_level INT NULL;