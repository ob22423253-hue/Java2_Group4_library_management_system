package com.university.universitylibrarysystem.service;

import com.university.universitylibrarysystem.dto.StudentMajorMinorDTO;
import java.util.List;

/**
 * Service interface for managing StudentMajorMinor entities.
 */
public interface StudentMajorMinorService {

    StudentMajorMinorDTO create(StudentMajorMinorDTO dto);

    StudentMajorMinorDTO getById(Long id);

    List<StudentMajorMinorDTO> getAll();

    StudentMajorMinorDTO update(Long id, StudentMajorMinorDTO dto);

    void delete(Long id);
}
