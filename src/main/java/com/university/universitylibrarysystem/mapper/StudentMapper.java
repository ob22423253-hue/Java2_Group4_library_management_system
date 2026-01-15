package com.university.universitylibrarysystem.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;
import com.university.universitylibrarysystem.dto.StudentDTO;
import com.university.universitylibrarysystem.entity.Student;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface StudentMapper {
    StudentDTO toDto(Student entity);
    Student toEntity(StudentDTO dto);
}
