package com.university.universitylibrarysystem.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final StudentDetailsService studentDetailsService;
    private final LibrarianDetailsService librarianDetailsService;

    public JwtAuthenticationFilter(
            JwtService jwtService,
            StudentDetailsService studentDetailsService,
            LibrarianDetailsService librarianDetailsService
    ) {
        this.jwtService = jwtService;
        this.studentDetailsService = studentDetailsService;
        this.librarianDetailsService = librarianDetailsService;
    }

    @Override
protected boolean shouldNotFilter(HttpServletRequest request) {
    String path = request.getServletPath();
    return path.startsWith("/auth/");
}

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        final String jwt = authHeader.substring(7);
        final String username = jwtService.extractUsername(jwt);

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            UserDetails userDetails = null;

            // Try extracting role from JWT
            String roleFromToken = null;
            try {
                roleFromToken = jwtService.extractClaim(jwt, claims ->
                        claims.get("role", String.class)
                );
            } catch (Exception ignored) {}

            if (roleFromToken != null) {
                String normalizedRole = roleFromToken.startsWith("ROLE_")
                        ? roleFromToken
                        : "ROLE_" + roleFromToken;

                userDetails = new User(username, "", 
                        Collections.singletonList(new SimpleGrantedAuthority(normalizedRole)));

            } else {
                // Fallback DB lookup
                try {
                    userDetails = studentDetailsService.loadUserByUsername(username);
                } catch (UsernameNotFoundException e) {
                    userDetails = librarianDetailsService.loadUserByUsername(username);
                }
            }

            // Validate token before authentication
            if (userDetails != null && jwtService.isTokenValid(jwt, userDetails)) {
                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.getAuthorities()
                        );

                authToken.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request)
                );

                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        filterChain.doFilter(request, response);
    }
}
