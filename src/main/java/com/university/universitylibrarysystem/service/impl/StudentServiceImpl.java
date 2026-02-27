package com.university.universitylibrarysystem.service.impl;

import com.university.universitylibrarysystem.dto.StudentDTO;
import com.university.universitylibrarysystem.entity.Student;
import com.university.universitylibrarysystem.mapper.StudentMapper;
import com.university.universitylibrarysystem.repository.StudentRepository;
import com.university.universitylibrarysystem.service.StudentService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class StudentServiceImpl implements StudentService {

    private final StudentRepository studentRepository;
    private final StudentMapper studentMapper;

    private StudentDTO manualToDto(Student s) {
        StudentDTO dto = new StudentDTO();
        dto.setId(s.getId());
        dto.setStudentId(s.getStudentId());
        dto.setFirstName(s.getFirstName());
        dto.setLastName(s.getLastName());
        dto.setEmail(s.getEmail());
        dto.setDepartment(s.getDepartment());
        dto.setMajor(s.getMajor());
        dto.setMinorSubject(s.getMinorSubject());
        dto.setYearLevel(s.getYearLevel());
        dto.setUniversityCardId(s.getUniversityCardId());
        dto.setPhoneNumber(s.getPhoneNumber());
        dto.setPhotoUrl(s.getPhotoUrl());
        dto.setRfidUid(s.getRfidUid());
        dto.setFingerprintReference(s.getFingerprintReference());
        dto.setRole(s.getRole());
        dto.setActive(s.isActive());
        return dto;
    }

    @Override
    public StudentDTO saveStudent(StudentDTO dto) {
        Student entity = studentMapper.toEntity(dto);
        Student saved = studentRepository.save(entity);
        return maskPassword(manualToDto(saved));
    }

    @Override
    public List<StudentDTO> getAllStudents() {
        return studentRepository.findAll()
                .stream()
                .map(this::manualToDto)
                .map(this::maskPassword)
                .toList();
    }

    @Override
    public StudentDTO getStudentById(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found with ID: " + id));
        return maskPassword(manualToDto(student));
    }

    @Override
    public StudentDTO findById(Long id) {
        return getStudentById(id);
    }

    @Override
    public StudentDTO updateStudent(Long id, StudentDTO dto) {
        Student existing = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found with ID: " + id));

        existing.setFirstName(dto.getFirstName());
        existing.setLastName(dto.getLastName());
        existing.setStudentId(dto.getStudentId());
        existing.setEmail(dto.getEmail());
        existing.setDepartment(dto.getDepartment());
        existing.setMajor(dto.getMajor());
        existing.setMinorSubject(dto.getMinorSubject());
        existing.setYearLevel(dto.getYearLevel());
        existing.setUniversityCardId(dto.getUniversityCardId());
        existing.setPhoneNumber(dto.getPhoneNumber());
        existing.setPhotoUrl(dto.getPhotoUrl());
        existing.setRfidUid(dto.getRfidUid());
        existing.setFingerprintReference(dto.getFingerprintReference());
        existing.setRole(dto.getRole());
        existing.setActive(dto.isActive());

        if (dto.getPassword() != null && !dto.getPassword().isBlank()) {
            existing.setPassword(dto.getPassword());
        }

        Student saved = studentRepository.save(existing);
        return maskPassword(manualToDto(saved));
    }

    @Override
    public void deleteStudent(Long id) {
        if (!studentRepository.existsById(id)) {
            throw new RuntimeException("Student not found with ID: " + id);
        }
        studentRepository.deleteById(id);
    }

    @Override
    public StudentDTO findByUniversityCardId(String cardId) {
        Student student = studentRepository.findByUniversityCardId(cardId)
                .orElseThrow(() -> new RuntimeException("Student not found with card ID: " + cardId));
        return maskPassword(manualToDto(student));
    }

    @Override
    public Page<StudentDTO> searchStudents(String query, Pageable pageable) {
        return studentRepository.searchByNameOrEmail(query, pageable)
                .map(this::manualToDto)
                .map(this::maskPassword);
    }

    @Override
    public List<StudentDTO> searchByName(String name) {
        return studentRepository.searchByName(name)
                .stream()
                .map(this::manualToDto)
                .map(this::maskPassword)
                .toList();
    }

    @Override
    public StudentDTO findByRfidUid(String rfidUid) {
        Student student = studentRepository.findByRfidUid(rfidUid)
                .orElseThrow(() -> new RuntimeException("Student not found with RFID: " + rfidUid));
        return maskPassword(manualToDto(student));
    }

    @Override
    public StudentDTO findByStudentId(String studentId) {
        Student student = studentRepository.findByStudentId(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found with student ID: " + studentId));
        return maskPassword(manualToDto(student));
    }

    @Override
    public List<StudentDTO> getActiveStudents() {
        return studentRepository.findByActiveTrue()
                .stream()
                .map(this::manualToDto)
                .map(this::maskPassword)
                .toList();
    }

    @Override
    public List<StudentDTO> getStudentsCurrentlyInLibrary() {
        return studentRepository.findStudentsCurrentlyInLibrary()
                .stream()
                .map(this::manualToDto)
                .map(this::maskPassword)
                .toList();
    }

    private StudentDTO maskPassword(StudentDTO dto) {
        if (dto == null) return null;
        dto.setPassword(null);
        return dto;
    }
}