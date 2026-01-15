package com.university.universitylibrarysystem.service;


import com.university.universitylibrarysystem.entity.Course;
import java.util.List;
import java.util.Optional;

public interface CourseService {
    Course createCourse(Course course);
    Course updateCourse(Long id, Course course);
    void deleteCourse(Long id);
    List<Course> getAllCourses();
    Optional<Course> getCourseById(Long id);
    List<Course> getCoursesByDepartment(Long departmentId);
}
