package com.university.universitylibrarysystem.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;
import com.university.universitylibrarysystem.dto.StudentMajorMinorDTO;
import com.university.universitylibrarysystem.entity.StudentMajorMinor;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface StudentMajorMinorMapper {
    StudentMajorMinorDTO toDto(StudentMajorMinor entity);
    StudentMajorMinor toEntity(StudentMajorMinorDTO dto);
}
