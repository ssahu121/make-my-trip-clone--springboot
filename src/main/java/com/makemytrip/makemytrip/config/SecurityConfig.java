package com.makemytrip.makemytrip.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@Configuration
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http)
            throws Exception {

        http
                .cors(cors -> {})
                .csrf(csrf -> csrf.disable())

                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/",
                                "/flight",
                                "/flight/**",
                                "/hotel",

                                // USER
                                "/user/login",
                                "/user/signup",
                                "/user/email",

                                // ADMIN
                                "/admin/**",

                                // BOOKING
                                "/booking/**",

                                // REVIEWS
                                "/reviews/**"
                        ).permitAll()

                        .anyRequest().authenticated()
                );

        return http.build();
    }
}