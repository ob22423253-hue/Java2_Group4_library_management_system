package com.university.universitylibrarysystem.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "student_major_minor")
public class StudentMajorMinor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne
    @JoinColumn(name = "major_department_id", nullable = false)
    private Department majorDepartment;

    @ManyToOne
    @JoinColumn(name = "minor_department_id")
    private Department minorDepartment;
}
