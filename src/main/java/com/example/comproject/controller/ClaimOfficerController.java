package com.example.comproject.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.comproject.entity.ClaimOfficer;
import com.example.comproject.service.ClaimOfficerService;

@RestController
@RequestMapping("/api/claim-officers")
public class ClaimOfficerController {
    private final ClaimOfficerService claimOfficerService;

    public ClaimOfficerController(ClaimOfficerService claimOfficerService) {
        this.claimOfficerService = claimOfficerService;
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<ClaimOfficer> createClaimOfficer(@RequestBody ClaimOfficer claimOfficer) {
        return ResponseEntity.ok(claimOfficerService.createClaimOfficer(claimOfficer));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<List<ClaimOfficer>> getAllClaimOfficers() {
    List<ClaimOfficer> officers = claimOfficerService.getAllClaimOfficers();
    return ResponseEntity.ok(officers);
}

    @PreAuthorize("hasAnyRole('ADMIN', 'CLAIM_OFFICER')")
    @GetMapping("/{id}")
    public ResponseEntity<ClaimOfficer> getClaimOfficerById(@PathVariable Long id) {
        ClaimOfficer claimOfficer = claimOfficerService.getClaimOfficerById(id);
        return claimOfficer != null ? ResponseEntity.ok(claimOfficer) : ResponseEntity.notFound().build();
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'CLAIM_OFFICER')")
    @GetMapping("/by-user/{userId}")
    public ResponseEntity<ClaimOfficer> getClaimOfficerByUserId(@PathVariable Long userId) {
        ClaimOfficer claimOfficer = claimOfficerService.getClaimOfficerByUserId(userId);
        return claimOfficer != null ? ResponseEntity.ok(claimOfficer) : ResponseEntity.notFound().build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/available/{specialization}")
    public ResponseEntity<List<ClaimOfficer>> getAvailableClaimOfficersBySpecialization(@PathVariable String specialization) {
        return ResponseEntity.ok(claimOfficerService.getAvailableClaimOfficersBySpecialization(specialization));
    }
}
