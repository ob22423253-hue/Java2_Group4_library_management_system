package com.university.universitylibrarysystem.repository;

import com.university.universitylibrarysystem.entity.StudentMajorMinor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface StudentMajorMinorRepository extends JpaRepository<StudentMajorMinor, Long> {
    List<StudentMajorMinor> findByStudentId(Long studentId);
}
