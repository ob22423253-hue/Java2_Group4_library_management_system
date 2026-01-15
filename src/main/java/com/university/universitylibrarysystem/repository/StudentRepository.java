package com.university.universitylibrarysystem.repository;

import com.university.universitylibrarysystem.entity.Student;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Student entity operations.
 * Extends JpaRepository to inherit standard CRUD operations.
 * 
 * This repository handles:
 * - Basic CRUD operations for students
 * - Custom queries for library access management
 * - Search operations by various criteria
 */
@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {

    /**
     * Find a student by their unique student ID.
     * 
     * @param studentId The university-assigned student ID
     * @return Optional containing the student if found
     */
    Optional<Student> findByStudentId(String studentId);

    /**
     * Find a student by their email address.
     * 
     * @param email The student's email address
     * @return Optional containing the student if found
     */
    Optional<Student> findByEmail(String email);

    /**
     * Find a student by their RFID card UID.
     * 
     * @param rfidUid The RFID card's unique identifier
     * @return Optional containing the student if found
     */
    Optional<Student> findByRfidUid(String rfidUid);

    /**
     * Find a student by their university card ID.
     * 
     * @param cardId The university card ID
     * @return Optional containing the student if found
     */
    Optional<Student> findByUniversityCardId(String cardId);

    /**
     * Search for students by name or email.
     * 
     * @param query The search query
     * @param pageable Pagination information
     * @return Page of matching students
     */
    @Query("SELECT s FROM Student s WHERE " +
           "LOWER(s.firstName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(s.lastName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(s.email) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<Student> searchByNameOrEmail(@Param("query") String query, Pageable pageable);

    /**
     * Search for students by partial name match.
     * 
     * @param name Part of first name or last name
     * @return List of matching students
     */
    @Query("SELECT s FROM Student s WHERE LOWER(s.firstName) LIKE LOWER(CONCAT('%', :name, '%')) " +
           "OR LOWER(s.lastName) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<Student> searchByName(@Param("name") String name);

    /**
     * Find all students from a specific department.
     * 
     * @param department The department name
     * @return List of students in the department
     */
    List<Student> findByDepartment(String department);

    /**
     * Find all active students.
     * 
     * @return List of active students
     */
    List<Student> findByActiveTrue();

    /**
     * Count number of students in each department.
     * 
     * @return List of department names and their student counts
     */
    @Query("SELECT s.department, COUNT(s) FROM Student s GROUP BY s.department")
    List<Object[]> countStudentsByDepartment();

    /**
     * Find students who are currently in the library.
     * This query joins with LibraryEntry to find students who entered but haven't exited.
     * 
     * @return List of students currently in the library
     */
    @Query("SELECT DISTINCT s FROM Student s JOIN LibraryEntry e ON s.id = e.student.id " +
           "WHERE e.exitTime IS NULL")
    List<Student> findStudentsCurrentlyInLibrary();
}