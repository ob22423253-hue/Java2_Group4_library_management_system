package com.university.universitylibrarysystem.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;
import com.university.universitylibrarysystem.dto.FingerprintRecordDTO;
import com.university.universitylibrarysystem.entity.FingerprintRecord;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface FingerprintRecordMapper {
    FingerprintRecordDTO toDto(FingerprintRecord entity);
    FingerprintRecord toEntity(FingerprintRecordDTO dto);
}
