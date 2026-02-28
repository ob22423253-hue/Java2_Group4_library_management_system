package com.university.universitylibrarysystem.service.impl;

import com.university.universitylibrarysystem.dto.LibraryHoursDTO;
import com.university.universitylibrarysystem.dto.LibraryStatusDTO;
import com.university.universitylibrarysystem.entity.Librarian;
import com.university.universitylibrarysystem.entity.LibraryHours;
import com.university.universitylibrarysystem.repository.LibrarianRepository;
import com.university.universitylibrarysystem.repository.LibraryHoursRepository;
import com.university.universitylibrarysystem.service.LibraryHoursService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.TextStyle;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class LibraryHoursServiceImpl implements LibraryHoursService {

    private final LibraryHoursRepository libraryHoursRepository;
    private final LibrarianRepository librarianRepository;

    @Override
    @Transactional
    public LibraryHoursDTO saveHours(LibraryHoursDTO dto, String librarianUsername) {
        Librarian librarian = librarianRepository.findByUsername(librarianUsername)
                .orElseThrow(() -> new RuntimeException("Librarian not found: " + librarianUsername));

        // Deactivate old records
        libraryHoursRepository.findAll().forEach(h -> {
            h.setActive(false);
            libraryHoursRepository.save(h);
        });

        LibraryHours hours = new LibraryHours();
        hours.setLibrarian(librarian);
        hours.setOpenTime(dto.getOpenTime());
        hours.setCloseTime(dto.getCloseTime());
        hours.setWorkingDays(dto.getWorkingDays().toUpperCase());
        hours.setActive(true);

        LibraryHours saved = libraryHoursRepository.save(hours);
        return toDTO(saved);
    }

    @Override
    public LibraryHoursDTO getCurrentHours() {
        Optional<LibraryHours> hours = libraryHoursRepository.findTopByActiveTrueOrderByCreatedAtDesc();
        return hours.map(this::toDTO).orElse(null);
    }

    @Override
    public LibraryStatusDTO getLibraryStatus() {
        Optional<LibraryHours> hoursOpt = libraryHoursRepository.findTopByActiveTrueOrderByCreatedAtDesc();

        if (hoursOpt.isEmpty()) {
            return new LibraryStatusDTO(true, "Library is open", null, null, null);
        }

        LibraryHours hours = hoursOpt.get();
        boolean open = checkIsOpen(hours);

        String msg = open ? "Library is currently open" : "Library is currently closed";
        return new LibraryStatusDTO(
                open, msg,
                hours.getOpenTime().toString(),
                hours.getCloseTime().toString(),
                hours.getWorkingDays()
        );
    }

    @Override
    public boolean isLibraryOpen() {
        Optional<LibraryHours> hoursOpt = libraryHoursRepository.findTopByActiveTrueOrderByCreatedAtDesc();
        // Safe fallback: if no hours configured, allow scanning
        return hoursOpt.map(this::checkIsOpen).orElse(true);
    }

    private boolean checkIsOpen(LibraryHours hours) {
        LocalTime now = LocalTime.now();
        LocalDate today = LocalDate.now();

        // Get today's 3-letter day abbreviation in uppercase e.g. "MON"
        String todayAbbr = today.getDayOfWeek()
                .getDisplayName(TextStyle.SHORT, Locale.ENGLISH)
                .toUpperCase();

        List<String> workingDayList = Arrays.asList(hours.getWorkingDays().split(","));
        boolean isWorkingDay = workingDayList.stream()
                .map(String::trim)
                .anyMatch(d -> d.equals(todayAbbr));

        if (!isWorkingDay) return false;

        return !now.isBefore(hours.getOpenTime()) && !now.isAfter(hours.getCloseTime());
    }

    private LibraryHoursDTO toDTO(LibraryHours h) {
        LibraryHoursDTO dto = new LibraryHoursDTO();
        dto.setId(h.getId());
        dto.setOpenTime(h.getOpenTime());
        dto.setCloseTime(h.getCloseTime());
        dto.setWorkingDays(h.getWorkingDays());
        dto.setActive(h.isActive());
        dto.setCreatedAt(h.getCreatedAt());
        dto.setUpdatedAt(h.getUpdatedAt());
        return dto;
    }
}