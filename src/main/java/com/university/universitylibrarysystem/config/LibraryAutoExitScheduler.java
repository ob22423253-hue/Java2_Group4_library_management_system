package com.university.universitylibrarysystem.config;

import com.university.universitylibrarysystem.entity.LibraryEntry;
import com.university.universitylibrarysystem.repository.LibraryEntryRepository;
import com.university.universitylibrarysystem.service.LibraryHoursService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class LibraryAutoExitScheduler {

    private final LibraryHoursService libraryHoursService;
    private final LibraryEntryRepository libraryEntryRepository;

    /**
     * Runs every 60 seconds.
     * If library is closed, auto-exit all students who are still inside.
     * Reuses the same exitTime/exitCaptureRef logic as ScanController.
     */
    @Scheduled(fixedDelay = 60000)
    @Transactional
    public void autoExitIfLibraryClosed() {
        if (!libraryHoursService.isLibraryOpen()) {
            List<LibraryEntry> stillInside = libraryEntryRepository.findAllWithStudent()
                    .stream()
                    .filter(e -> e.getExitTime() == null)
                    .toList();

            if (!stillInside.isEmpty()) {
                log.info("[AutoExit] Library is closed. Auto-exiting {} student(s).", stillInside.size());
                LocalDateTime now = LocalDateTime.now();
                stillInside.forEach(entry -> {
                    entry.setExitTime(now);
                    entry.setExitCaptureRef("AUTO_EXIT_LIBRARY_CLOSED");
                    libraryEntryRepository.save(entry);
                    log.info("[AutoExit] Auto-exited student: {}",
                            entry.getStudent() != null ? entry.getStudent().getStudentId() : entry.getId());
                });
            }
        }
    }
}
    

