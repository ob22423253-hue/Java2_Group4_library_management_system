package com.university.universitylibrarysystem.security;

import com.university.universitylibrarysystem.entity.Librarian;
import com.university.universitylibrarysystem.repository.LibrarianRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LibrarianDetailsService implements UserDetailsService {

    private final LibrarianRepository librarianRepository;

    public LibrarianDetailsService(LibrarianRepository librarianRepository) {
        this.librarianRepository = librarianRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Librarian librarian = librarianRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        var authorities = List.of(new SimpleGrantedAuthority(librarian.getRole().getValue()));

        return new User(
                librarian.getUsername(),
                librarian.getPasswordHash(),
                librarian.isActive(),
                true,
                true,
                true,
                authorities
        );
    }
}
