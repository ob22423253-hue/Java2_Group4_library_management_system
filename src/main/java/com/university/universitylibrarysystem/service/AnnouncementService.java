package com.university.universitylibrarysystem.service;

import com.university.universitylibrarysystem.dto.AnnouncementDTO;
import java.util.List;

public interface AnnouncementService {
    AnnouncementDTO create(AnnouncementDTO dto, String librarianUsername);
    AnnouncementDTO update(Long id, AnnouncementDTO dto);
    void delete(Long id);
    List<AnnouncementDTO> getActive();
    List<AnnouncementDTO> getAll();
}