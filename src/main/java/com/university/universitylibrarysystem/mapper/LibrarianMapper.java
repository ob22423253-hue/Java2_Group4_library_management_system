package com.university.universitylibrarysystem.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;
import com.university.universitylibrarysystem.dto.LibrarianDTO;
import com.university.universitylibrarysystem.entity.Librarian;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface LibrarianMapper {
    LibrarianDTO toDto(Librarian entity);
    Librarian toEntity(LibrarianDTO dto);
}
