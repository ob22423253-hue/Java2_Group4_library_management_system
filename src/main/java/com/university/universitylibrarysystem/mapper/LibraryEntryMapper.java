package com.university.universitylibrarysystem.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;
import com.university.universitylibrarysystem.dto.LibraryEntryDTO;
import com.university.universitylibrarysystem.entity.LibraryEntry;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface LibraryEntryMapper {
    LibraryEntryDTO toDto(LibraryEntry entity);
    LibraryEntry toEntity(LibraryEntryDTO dto);
}
