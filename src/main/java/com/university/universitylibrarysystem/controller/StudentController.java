package com.university.universitylibrarysystem.controller;

import com.university.universitylibrarysystem.dto.StudentDTO;
import com.university.universitylibrarysystem.service.StudentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/students") // server.servlet.context-path=/api/v1 makes final path /api/v1/students
@RequiredArgsConstructor
public class StudentController {

    private final StudentService studentService;

    // Get all students
    @GetMapping
    public ResponseEntity<List<StudentDTO>> getAllStudents() {
        List<StudentDTO> students = studentService.getAllStudents();
        return ResponseEntity.ok(students);
    }

    // Get student by ID
    @GetMapping("/{id}")
    public ResponseEntity<StudentDTO> getStudentById(@PathVariable Long id) {
        StudentDTO student = studentService.getStudentById(id);
        return ResponseEntity.ok(student);
    }

    // Get student by university-assigned studentId (e.g. "12345678")
    @GetMapping("/student-id/{studentId}")
    public ResponseEntity<StudentDTO> getStudentByStudentId(@PathVariable String studentId) {
        StudentDTO student = studentService.findByStudentId(studentId);
        return ResponseEntity.ok(student);
    }

    // Get student by RFID UID (convenience endpoint for frontend scanners)
    @GetMapping("/rfid/{rfidUid}")
    public ResponseEntity<StudentDTO> getStudentByRfid(@PathVariable String rfidUid) {
        StudentDTO student = studentService.findByRfidUid(rfidUid);
        return ResponseEntity.ok(student);
    }

    // Create student (use POST for create; you can also add PUT for updates if desired)
    @PostMapping
    public ResponseEntity<StudentDTO> saveStudent(@Valid @RequestBody StudentDTO studentDTO) {
        StudentDTO savedStudent = studentService.saveStudent(studentDTO);
        return ResponseEntity.ok(savedStudent);
    }
}
