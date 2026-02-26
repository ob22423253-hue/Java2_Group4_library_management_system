package com.university.universitylibrarysystem.controller;

import com.university.universitylibrarysystem.dto.StudentDTO;
import com.university.universitylibrarysystem.service.StudentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/students")
@RequiredArgsConstructor
public class StudentController {

    private final StudentService studentService;

    // Get all students
    @GetMapping
    public ResponseEntity<List<StudentDTO>> getAllStudents() {
        return ResponseEntity.ok(studentService.getAllStudents());
    }

    // Get student by DB id
    @GetMapping("/{id}")
    public ResponseEntity<StudentDTO> getStudentById(@PathVariable Long id) {
        return ResponseEntity.ok(studentService.getStudentById(id));
    }

    // Get student by university studentId (e.g. "12345678")
    @GetMapping("/student-id/{studentId}")
    public ResponseEntity<StudentDTO> getStudentByStudentId(@PathVariable String studentId) {
        return ResponseEntity.ok(studentService.findByStudentId(studentId));
    }

    // Get student by RFID UID
    @GetMapping("/rfid/{rfidUid}")
    public ResponseEntity<StudentDTO> getStudentByRfid(@PathVariable String rfidUid) {
        return ResponseEntity.ok(studentService.findByRfidUid(rfidUid));
    }

    // Create student
    @PostMapping
    public ResponseEntity<StudentDTO> saveStudent(@Valid @RequestBody StudentDTO studentDTO) {
        return ResponseEntity.ok(studentService.saveStudent(studentDTO));
    }

    // Update student
    @PutMapping("/{id}")
    public ResponseEntity<StudentDTO> updateStudent(
            @PathVariable Long id,
            @Valid @RequestBody StudentDTO studentDTO) {
        return ResponseEntity.ok(studentService.updateStudent(id, studentDTO));
    }

    // Delete student
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStudent(@PathVariable Long id) {
        studentService.deleteStudent(id);
        return ResponseEntity.noContent().build();
    }
}