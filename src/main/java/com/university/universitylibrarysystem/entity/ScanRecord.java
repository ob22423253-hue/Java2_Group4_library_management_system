package com.university.universitylibrarysystem.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "scan_records")
@Getter
@Setter
@NoArgsConstructor
public class ScanRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // store relation to Student
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id_fk", nullable = false)
    private Student student;

    @Column(name = "scan_type", nullable = false, length = 10)
    @Enumerated(EnumType.STRING)
    private ScanType scanType;

    @Column(name = "scan_time", nullable = false)
    private LocalDateTime scanTime;

    public enum ScanType {
        ENTRY, EXIT
    }
}
