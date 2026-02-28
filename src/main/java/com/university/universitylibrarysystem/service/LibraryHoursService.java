package com.university.universitylibrarysystem.service;

import com.university.universitylibrarysystem.dto.LibraryHoursDTO;
import com.university.universitylibrarysystem.dto.LibraryStatusDTO;

public interface LibraryHoursService {
    LibraryHoursDTO saveHours(LibraryHoursDTO dto, String librarianUsername);
    LibraryHoursDTO getCurrentHours();
    LibraryStatusDTO getLibraryStatus();
    boolean isLibraryOpen();
}