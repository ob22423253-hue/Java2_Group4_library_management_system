package com.university.universitylibrarysystem.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;
import com.university.universitylibrarysystem.dto.BorrowRecordDTO;
import com.university.universitylibrarysystem.entity.BorrowRecord;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface BorrowRecordMapper {
    BorrowRecordDTO toDto(BorrowRecord entity);
    BorrowRecord toEntity(BorrowRecordDTO dto);
}
