package com.university.universitylibrarysystem.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;
import com.university.universitylibrarysystem.dto.DepartmentDTO;
import com.university.universitylibrarysystem.entity.Department;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface DepartmentMapper {
    DepartmentDTO toDto(Department entity);
    Department toEntity(DepartmentDTO dto);
}
