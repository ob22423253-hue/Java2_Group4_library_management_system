package com.university.universitylibrarysystem.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;
import com.university.universitylibrarysystem.dto.CCTVEventDTO;
import com.university.universitylibrarysystem.entity.CCTVEvent;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface CCTVEventMapper {
    CCTVEventDTO toDto(CCTVEvent entity);
    CCTVEvent toEntity(CCTVEventDTO dto);
}
