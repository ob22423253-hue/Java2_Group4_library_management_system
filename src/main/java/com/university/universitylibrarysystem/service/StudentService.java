package com.university.universitylibrarysystem.service;

import com.university.universitylibrarysystem.dto.StudentDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface StudentService {

    StudentDTO saveStudent(StudentDTO dto);
    StudentDTO updateStudent(Long id, StudentDTO dto);
    StudentDTO getStudentById(Long id);
    StudentDTO findById(Long id); // <-- ADDED
    List<StudentDTO> getAllStudents();
    void deleteStudent(Long id);

    Page<StudentDTO> searchStudents(String query, Pageable pageable);
    List<StudentDTO> searchByName(String name);

    StudentDTO findByUniversityCardId(String cardId);
    StudentDTO findByRfidUid(String rfidUid);
    StudentDTO findByStudentId(String studentId);

    List<StudentDTO> getActiveStudents();
    List<StudentDTO> getStudentsCurrentlyInLibrary();
}
