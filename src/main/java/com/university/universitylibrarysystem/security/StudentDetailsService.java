package com.university.universitylibrarysystem.security;

import com.university.universitylibrarysystem.entity.Student;
import com.university.universitylibrarysystem.repository.StudentRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StudentDetailsService implements UserDetailsService {

    private final StudentRepository studentRepository;

    public StudentDetailsService(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Student student = studentRepository.findByStudentId(username)
                .orElseThrow(() -> new UsernameNotFoundException("Student not found: " + username));

        var authorities = List.of(new SimpleGrantedAuthority("ROLE_STUDENT"));

        return new User(
                student.getStudentId(),
                student.getPassword(),
                student.isActive(),
                true,
                true,
                true,
                authorities
        );
    }
}
