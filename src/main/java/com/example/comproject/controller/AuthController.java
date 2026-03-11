package com.example.comproject.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.comproject.dto.LoginRequestDTO;
import com.example.comproject.dto.LoginResponseDTO;
import com.example.comproject.entity.User;
import com.example.comproject.repository.UserRepository;
import com.example.comproject.util.JwtUtil;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthController(UserRepository userRepository,
                          PasswordEncoder passwordEncoder,
                          JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@RequestBody LoginRequestDTO request) {
       
        System.out.println("Email received: [" + request.getEmail() + "]");
        System.out.println("Password received: [" + request.getPassword() + "]");

        if (request.getEmail() == null || request.getEmail().isBlank()) {
            System.err.println("Email is null or empty");
        }
        if (request.getPassword() == null || request.getPassword().isBlank()) {
            System.err.println("Password is null or empty");
        }

        //check hardcoded admin details
        if ("admin@shield.com".equals(request.getEmail()) 
                && "admin123".equals(request.getPassword())) {

            if (request.getRole() != null && !request.getRole().equalsIgnoreCase("ADMIN")) {
                throw new RuntimeException("Selected role does not match your account.");
            }

            String token = jwtUtil.generateToken("admin@shield.com", "ADMIN");
            LoginResponseDTO response = new LoginResponseDTO();
            response.setToken(token);
            response.setRole("ADMIN");
            response.setUserId(null);
            response.setFullName("Admin");
            response.setEmail("admin@shield.com");
            return ResponseEntity.ok(response);
        }

        //find user by email 
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        //check if account is active
        if (user.getStatus() != User.Status.ACTIVE) {
            throw new RuntimeException("Your account is not active. Please contact admin.");
        }

        //check if password is set
        if (user.getPassword() == null) {
            throw new RuntimeException("Account not fully activated. Please contact admin.");
        }

        //Validate password
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        // Validate role explicitly
        if (request.getRole() != null && !request.getRole().equalsIgnoreCase(user.getRole().name())) {
            throw new RuntimeException("Selected role does not match your account.");
        }

        // Generate token using email + role
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());

        // Build response
        LoginResponseDTO response = new LoginResponseDTO();
        response.setToken(token);
        response.setRole(user.getRole().name());
        response.setUserId(user.getId());
        response.setFullName(user.getFullName());
        response.setEmail(user.getEmail());

        return ResponseEntity.ok(response);
    }
}