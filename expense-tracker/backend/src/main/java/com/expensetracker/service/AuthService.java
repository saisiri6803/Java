package com.expensetracker.service;

import com.expensetracker.dto.AuthResponseDTO;
import com.expensetracker.dto.LoginRequestDTO;
import com.expensetracker.dto.RegisterRequestDTO;
import com.expensetracker.model.Role;
import com.expensetracker.model.User;
import com.expensetracker.repository.UserRepository;
import com.expensetracker.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class AuthService {

        private final UserRepository userRepository;
        private final PasswordEncoder passwordEncoder;
        private final AuthenticationManager authenticationManager;
        private final JwtService jwtService;

        @Transactional
        public AuthResponseDTO register(RegisterRequestDTO request) {
                String email = request.getEmail().trim().toLowerCase();

                if (userRepository.existsByEmail(email)) {
                        throw new ResponseStatusException(
                                        HttpStatus.CONFLICT,
                                        "An account with this email already exists");
                }

                User user = User.builder()
                                .name(request.getName().trim())
                                .email(email)
                                .password(passwordEncoder.encode(request.getPassword()))
                                .role(Role.USER)
                                .build();

                User savedUser = userRepository.save(user);

                UserDetails userDetails = org.springframework.security.core.userdetails.User
                                .withUsername(savedUser.getEmail())
                                .password(savedUser.getPassword())
                                .roles(savedUser.getRole().name())
                                .build();

                String token = jwtService.generateToken(userDetails);

                return AuthResponseDTO.builder()
                                .token(token)
                                .userId(savedUser.getId())
                                .name(savedUser.getName())
                                .email(savedUser.getEmail())
                                .build();
        }

        public AuthResponseDTO login(LoginRequestDTO request) {
                String email = request.getEmail().trim().toLowerCase();

                authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(
                                                email,
                                                request.getPassword()));

                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new ResponseStatusException(
                                                HttpStatus.UNAUTHORIZED,
                                                "Invalid email or password"));

                UserDetails userDetails = org.springframework.security.core.userdetails.User
                                .withUsername(user.getEmail())
                                .password(user.getPassword())
                                .roles(user.getRole().name())
                                .build();

                String token = jwtService.generateToken(userDetails);

                return AuthResponseDTO.builder()
                                .token(token)
                                .userId(user.getId())
                                .name(user.getName())
                                .email(user.getEmail())
                                .build();
        }
}