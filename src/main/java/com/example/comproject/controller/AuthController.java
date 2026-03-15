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
import com.example.comproject.exception.UnauthorizedException;
import com.example.comproject.repository.UserRepository;
import com.example.comproject.util.JwtUtil;
import com.example.comproject.service.EmailService;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Random;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final EmailService emailService;

    public AuthController(UserRepository userRepository,
                          PasswordEncoder passwordEncoder,
                          JwtUtil jwtUtil,
                          EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.emailService = emailService;
    }

    private final Map<String, String> otpStorage = new ConcurrentHashMap<>();

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (email == null || email.isBlank()) {
            throw new UnauthorizedException("Email is required");
        }
        User user = userRepository.findByEmail(email).orElseThrow(() -> new UnauthorizedException("User not found"));

        if (user.getRole() == User.Role.ADMIN) {
             throw new UnauthorizedException("Admin password cannot be reset this way.");
        }

        String otp = String.format("%06d", new Random().nextInt(999999));
        otpStorage.put(email, otp);

        System.out.println("====== OTP NOTIFICATION ======");
        System.out.println("OTP for reset password for user " + email + " is: " + otp);
        System.out.println("==============================");
        
        emailService.sendOtpEmail(email, otp);

        return ResponseEntity.ok(Map.of("message", "OTP sent to registered email"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otp = request.get("otp");
        String newPassword = request.get("newPassword");

        if (email == null || otp == null || newPassword == null) {
            throw new UnauthorizedException("All fields are required");
        }

        String storedOtp = otpStorage.get(email);
        if (storedOtp == null || !storedOtp.equals(otp)) {
            throw new UnauthorizedException("Invalid or expired OTP");
        }

        User user = userRepository.findByEmail(email).orElseThrow(() -> new UnauthorizedException("User not found"));
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        otpStorage.remove(email);

        return ResponseEntity.ok(Map.of("message", "Password reset successfully"));
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
                throw new UnauthorizedException("Selected role does not match your account.");
            }

            String token = jwtUtil.generateToken("admin@shield.com", "ADMIN");
            LoginResponseDTO response = new LoginResponseDTO();
            response.setToken(token);
            response.setRole("ADMIN");
            response.setUserId(null);
            response.setEmail("admin@shield.com");
            return ResponseEntity.ok(response);
        }

        //find user by email 
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UnauthorizedException("Invalid credentials"));

        //check if account is active
        if (user.getStatus() != User.Status.ACTIVE) {
            throw new UnauthorizedException("Your account is not active. Please contact admin.");
        }

        //check if password is set
        if (user.getPassword() == null) {
            throw new UnauthorizedException("Account not fully activated. Please contact admin.");
        }

        //Validate password
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new UnauthorizedException("Invalid credentials");
        }

        // Validate role explicitly
        if (request.getRole() != null && !request.getRole().equalsIgnoreCase(user.getRole().name())) {
            throw new UnauthorizedException("Selected role does not match.");
        }

        // Generate token using email + role
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());

        // Build response
        LoginResponseDTO response = new LoginResponseDTO();
        response.setToken(token);
        response.setRole(user.getRole().name());
        response.setUserId(user.getId());
        response.setEmail(user.getEmail());

        return ResponseEntity.ok(response);
    }
}