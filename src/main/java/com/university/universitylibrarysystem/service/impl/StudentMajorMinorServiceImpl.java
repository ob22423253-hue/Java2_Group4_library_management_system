package com.university.universitylibrarysystem.service.impl;

import com.university.universitylibrarysystem.dto.StudentMajorMinorDTO;
import com.university.universitylibrarysystem.entity.Student;
import com.university.universitylibrarysystem.entity.StudentMajorMinor;
import com.university.universitylibrarysystem.entity.Department;
import com.university.universitylibrarysystem.repository.StudentMajorMinorRepository;
import com.university.universitylibrarysystem.repository.StudentRepository;
import com.university.universitylibrarysystem.repository.DepartmentRepository;
import com.university.universitylibrarysystem.service.StudentMajorMinorService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class StudentMajorMinorServiceImpl implements StudentMajorMinorService {

    private final StudentMajorMinorRepository studentMajorMinorRepository;
    private final StudentRepository studentRepository;
    private final DepartmentRepository departmentRepository;

    @Override
    public StudentMajorMinorDTO create(StudentMajorMinorDTO dto) {
        StudentMajorMinor entity = new StudentMajorMinor();
        mapDtoToEntity(dto, entity);
        entity = studentMajorMinorRepository.save(entity);
        return mapEntityToDto(entity);
    }

    @Override
    public StudentMajorMinorDTO getById(Long id) {
        StudentMajorMinor entity = studentMajorMinorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("StudentMajorMinor not found"));
        return mapEntityToDto(entity);
    }

    @Override
    public List<StudentMajorMinorDTO> getAll() {
        return studentMajorMinorRepository.findAll()
                .stream()
                .map(this::mapEntityToDto)
                .collect(Collectors.toList());
    }

    @Override
    public StudentMajorMinorDTO update(Long id, StudentMajorMinorDTO dto) {
        StudentMajorMinor entity = studentMajorMinorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("StudentMajorMinor not found"));
        mapDtoToEntity(dto, entity);
        entity = studentMajorMinorRepository.save(entity);
        return mapEntityToDto(entity);
    }

    @Override
    public void delete(Long id) {
        studentMajorMinorRepository.deleteById(id);
    }

    // ------------------- Helper Methods -------------------

    private void mapDtoToEntity(StudentMajorMinorDTO dto, StudentMajorMinor entity) {
        Student student = studentRepository.findById(dto.getStudentId())
                .orElseThrow(() -> new RuntimeException("Student not found"));
        Department major = departmentRepository.findById(dto.getMajorDepartmentId())
                .orElseThrow(() -> new RuntimeException("Major department not found"));
        Department minor = null;
        if (dto.getMinorDepartmentId() != null) {
            minor = departmentRepository.findById(dto.getMinorDepartmentId())
                    .orElseThrow(() -> new RuntimeException("Minor department not found"));
        }
        entity.setStudent(student);
        entity.setMajorDepartment(major);
        entity.setMinorDepartment(minor);
    }

    private StudentMajorMinorDTO mapEntityToDto(StudentMajorMinor entity) {
        StudentMajorMinorDTO dto = new StudentMajorMinorDTO();
        dto.setId(entity.getId());
        dto.setStudentId(entity.getStudent().getId());
        dto.setMajorDepartmentId(entity.getMajorDepartment().getId());
        if (entity.getMinorDepartment() != null) {
            dto.setMinorDepartmentId(entity.getMinorDepartment().getId());
        }
        return dto;
    }
}
