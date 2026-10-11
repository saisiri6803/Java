package com.expensetracker.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;
import java.util.Collections;

@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();

        // 💡 Allow BOTH your local machine and your live Vercel production website
        config.setAllowedOrigins(Arrays.asList(
                "https://expense-tracker-gqls5lh8f-sai-sirisha-sabbellas-projects.vercel.app/",
                "http://localhost:3000"));

        // Allow all standard REST methods and headers needed for JWT authorization
        // tokens
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        config.setAllowedHeaders(
                Arrays.asList("Authorization", "Content-Type", "Cache-Control", "Accept", "X-Requested-With"));
        config.setExposedHeaders(Collections.singletonList("Authorization"));
        config.setAllowCredentials(true);

        // Register this configuration rule globally for all API endpoints
        source.registerCorsConfiguration("/api/**", config);
        return new CorsFilter(source);
    }
}
