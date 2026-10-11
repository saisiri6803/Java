package com.expensetracker.controller;

import com.expensetracker.dto.ApiResponse;
import com.expensetracker.dto.AuthResponseDTO;
import com.expensetracker.dto.LoginRequestDTO;
import com.expensetracker.dto.RegisterRequestDTO;
import com.expensetracker.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

        private final AuthService authService;

        @PostMapping("/register")
        public ResponseEntity<ApiResponse<AuthResponseDTO>> register(
                        @Valid @RequestBody RegisterRequestDTO request) {

                AuthResponseDTO response = authService.register(request);

                return ResponseEntity.status(HttpStatus.CREATED)
                                .body(ApiResponse.success(
                                                "Registration successful",
                                                response));
        }

        @PostMapping("/login")
        public ResponseEntity<ApiResponse<AuthResponseDTO>> login(
                        @Valid @RequestBody LoginRequestDTO request) {

                AuthResponseDTO response = authService.login(request);

                return ResponseEntity.ok(
                                ApiResponse.success("Login successful", response));
        }
}