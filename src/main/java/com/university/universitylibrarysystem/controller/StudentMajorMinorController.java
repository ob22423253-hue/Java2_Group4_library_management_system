package com.university.universitylibrarysystem.controller;


import com.university.universitylibrarysystem.dto.StudentMajorMinorDTO;
import com.university.universitylibrarysystem.service.StudentMajorMinorService;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.List;

@RestController
@RequestMapping("/student-major-minor")
public class StudentMajorMinorController {

    private final StudentMajorMinorService studentMajorMinorService;

    @Autowired
    public StudentMajorMinorController(StudentMajorMinorService studentMajorMinorService) {
        this.studentMajorMinorService = studentMajorMinorService;
    }

    // Create a new StudentMajorMinor record
    @PostMapping
    public StudentMajorMinorDTO create(@RequestBody StudentMajorMinorDTO dto) {
        return studentMajorMinorService.create(dto);
    }

    // Get all StudentMajorMinor records
    @GetMapping
    public List<StudentMajorMinorDTO> getAll() {
        return studentMajorMinorService.getAll();
    }

    // Get a specific StudentMajorMinor record by ID
    @GetMapping("/{id}")
    public StudentMajorMinorDTO getById(@PathVariable Long id) {
        return studentMajorMinorService.getById(id);
    }

    // Update an existing StudentMajorMinor record
    @PutMapping("/{id}")
    public StudentMajorMinorDTO update(@PathVariable Long id, @RequestBody StudentMajorMinorDTO dto) {
        return studentMajorMinorService.update(id, dto);
    }

    // Delete a StudentMajorMinor record by ID
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        studentMajorMinorService.delete(id);
    }
}
