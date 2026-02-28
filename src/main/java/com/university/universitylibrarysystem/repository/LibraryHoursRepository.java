package com.university.universitylibrarysystem.repository;

import com.university.universitylibrarysystem.entity.LibraryHours;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface LibraryHoursRepository extends JpaRepository<LibraryHours, Long> {
    Optional<LibraryHours> findTopByActiveTrueOrderByCreatedAtDesc();
}