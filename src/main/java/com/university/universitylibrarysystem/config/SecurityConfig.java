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
            // Disable CSRF (React + JWT)
            .csrf(csrf -> csrf.disable())
            // Enable CORS
            .cors(Customizer.withDefaults())
            // Stateless session
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            // Authentication providers
            .authenticationProvider(librarianAuthProvider())
            .authenticationProvider(studentAuthProvider())
            // Authorization rules
            .authorizeHttpRequests(auth -> auth
                // Public auth endpoints (allow both servlet-level and full context path)
                .requestMatchers("/auth/**", "/api/v1/auth/**").permitAll()
                // Preflight
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                // Student-only endpoints (scan)
                .requestMatchers("/scan").hasAuthority("ROLE_STUDENT")
                // Librarian endpoints (librarian/admin)
                .requestMatchers("/librarian/**").hasAnyAuthority(
                    "ROLE_LIBRARIAN",
                    "ROLE_ADMIN"
                )                
                // Everything else requires authentication
                .anyRequest().authenticated()
            )
            // JWT filter before username/password auth
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // ------------------- Authentication Providers -------------------

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

    // ------------------- Password Encoder -------------------
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // ------------------- Authentication Manager -------------------
    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    // ------------------- CORS Configuration -------------------
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration config = new CorsConfiguration();
        // Allow local dev origins and use origin patterns to be permissive during development.
        // Production should restrict this to exact origins.
        config.setAllowedOriginPatterns(List.of("http://localhost:3000", "http://localhost:5173", "http://localhost:3001", "http://localhost:8000", "*"));
        config.setAllowedMethods(List.of("GET","POST","PUT","DELETE","OPTIONS"));
        // Allow Authorization header for JWT Bearer tokens and common headers
        config.setAllowedHeaders(List.of("*", "Authorization", "Content-Type"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
