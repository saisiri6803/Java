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

                return createAuthResponse(savedUser);
        }

        @Transactional // Added transactional support for the lazy seeding mechanism
        public AuthResponseDTO login(LoginRequestDTO request) {
                String email = request.getEmail().trim().toLowerCase();

                // 💡 STAJ FIX: If it's the tester account and doesn't exist yet, seed it
                // automatically!
                if ("tester@example.com".equals(email) && !userRepository.existsByEmail(email)) {
                        User tester = User.builder()
                                        .name("Demo Tester")
                                        .email("tester@example.com")
                                        .password(passwordEncoder.encode("Tester@123"))
                                        .role(Role.USER)
                                        .build();
                        userRepository.save(tester);
                }

                // Authenticate credentials against the database records
                authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(
                                                email,
                                                request.getPassword()));

                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new ResponseStatusException(
                                                HttpStatus.UNAUTHORIZED,
                                                "Invalid email or password"));

                return createAuthResponse(user);
        }

        // Helper method to keep code DRY (Don't Repeat Yourself)
        private AuthResponseDTO createAuthResponse(User user) {
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
