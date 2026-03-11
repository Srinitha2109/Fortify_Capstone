package com.example.comproject.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.comproject.dto.UserDTO;
import com.example.comproject.service.UserService;

@RestController
@RequestMapping("/api")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // ✅ PUBLIC - Registration request (no auth required)
    @PostMapping("/auth/request-registration")
    public ResponseEntity<UserDTO> submitRegistrationRequest(@RequestBody UserDTO user) {
        return ResponseEntity.ok(userService.submitRegistrationRequest(user));
    }

    // ADMIN - View pending registrations
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/registration-requests")
    public ResponseEntity<List<UserDTO>> getPendingRegistrations() {
        return ResponseEntity.ok(userService.getPendingRegistrations());
    }

    // ADMIN - Approve registration
    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/admin/registration-requests/{id}/approve")
    public ResponseEntity<UserDTO> approveRegistration(@PathVariable Long id) {
        return ResponseEntity.ok(userService.approveRegistration(id));
    }

    // ADMIN - Reject registration
    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/admin/registration-requests/{id}/reject")
    public ResponseEntity<UserDTO> rejectRegistration(@PathVariable Long id, @RequestBody String remarks) {
        return ResponseEntity.ok(userService.rejectRegistration(id, remarks));
    }

    // ✅ ADMIN - Get all users
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/users")
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    // ✅ ADMIN - Get user by ID
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/users/{id}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    // ✅ ADMIN - Update user
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/admin/users/{id}")
    public ResponseEntity<UserDTO> updateUser(@PathVariable Long id, @RequestBody UserDTO user) {
        return ResponseEntity.ok(userService.updateUser(id, user));
    }

    // ✅ ADMIN - Deactivate user
    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/admin/users/{id}/deactivate")
    public ResponseEntity<UserDTO> deactivateUser(@PathVariable Long id) {
        return ResponseEntity.ok(userService.deactivateUser(id));
    }

    // ✅ ADMIN - Activate user
    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/admin/users/{id}/activate")
    public ResponseEntity<UserDTO> activateUser(@PathVariable Long id) {
        return ResponseEntity.ok(userService.activateUser(id));
    }
}
