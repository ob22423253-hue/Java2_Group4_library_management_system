package com.university.universitylibrarysystem.config;

import com.university.universitylibrarysystem.security.JwtAuthenticationFilter;
import com.university.universitylibrarysystem.security.LibrarianDetailsService;
import com.university.universitylibrarysystem.security.StudentDetailsService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.*;

import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final LibrarianDetailsService librarianDetailsService;
    private final StudentDetailsService studentDetailsService;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
            .csrf(csrf -> csrf.disable())
            .cors(Customizer.withDefaults())
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .authenticationProvider(librarianAuthProvider())
            .authenticationProvider(studentAuthProvider())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/auth/**").permitAll()
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/error").permitAll()

                // Library status — both students and librarians can check
                .requestMatchers("/library-hours/status").hasAnyAuthority("ROLE_STUDENT", "ROLE_LIBRARIAN", "ROLE_ADMIN")
                .requestMatchers("/library-hours").hasAnyAuthority("ROLE_LIBRARIAN", "ROLE_ADMIN")
                // Announcements — students can read active, librarians can manage
                .requestMatchers(HttpMethod.GET, "/announcements").hasAnyAuthority("ROLE_STUDENT", "ROLE_LIBRARIAN", "ROLE_ADMIN")
                .requestMatchers("/announcements/**").hasAnyAuthority("ROLE_LIBRARIAN", "ROLE_ADMIN")

                // Student scan
                .requestMatchers("/scan").hasAuthority("ROLE_STUDENT")
                // Librarian-only endpoints
                .requestMatchers("/librarian/**").hasAnyAuthority(
                    "ROLE_LIBRARIAN", "ROLE_ADMIN"
                )
                // Borrow records — librarian can borrow/return, student can view their own
                .requestMatchers("/borrow-records/**").hasAnyAuthority(
                    "ROLE_LIBRARIAN", "ROLE_ADMIN", "ROLE_STUDENT"
                )
                // Books — librarian can manage, student can view
                .requestMatchers("/books/**").hasAnyAuthority(
                    "ROLE_LIBRARIAN", "ROLE_ADMIN", "ROLE_STUDENT"
                )
                // Students — librarian can manage, student can view their own profile
                .requestMatchers("/students/**").hasAnyAuthority(
                    "ROLE_LIBRARIAN", "ROLE_ADMIN", "ROLE_STUDENT"
                )
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public DaoAuthenticationProvider librarianAuthProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(librarianDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public DaoAuthenticationProvider studentAuthProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(studentDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(List.of(
            "http://localhost:3000", "http://localhost:5173",
            "http://localhost:3001", "http://localhost:8000", "*"
        ));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*", "Authorization", "Content-Type"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}