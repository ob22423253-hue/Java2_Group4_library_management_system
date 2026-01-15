package com.university.universitylibrarysystem.service;

import com.university.universitylibrarysystem.entity.Department;
import java.util.List;
import java.util.Optional;

public interface DepartmentService {
    Department createDepartment(Department department);
    Department updateDepartment(Long id, Department department);
    void deleteDepartment(Long id);
    List<Department> getAllDepartments();
    Optional<Department> getDepartmentById(Long id);
}
