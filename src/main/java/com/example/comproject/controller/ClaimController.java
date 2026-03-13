package com.example.comproject.controller;

import com.example.comproject.dto.ClaimDTO;
import com.example.comproject.service.ClaimService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/claims")
public class ClaimController {
    private final ClaimService claimService;

    public ClaimController(ClaimService claimService) {
        this.claimService = claimService;
    }

    

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/assign-officer")
    public ResponseEntity<ClaimDTO> assignClaimOfficer(
            @PathVariable Long id,
            @RequestParam Long claimOfficerId) {
        return ResponseEntity.ok(claimService.assignClaimOfficer(id, claimOfficerId));
    }

    @PreAuthorize("hasRole('CLAIM_OFFICER')")
    @PutMapping("/{id}/approve")
    public ResponseEntity<ClaimDTO> approveClaim(@PathVariable Long id) {
        return ResponseEntity.ok(claimService.approveClaim(id));
    }

    @PreAuthorize("hasRole('CLAIM_OFFICER')")
    @PutMapping("/{id}/reject")
    public ResponseEntity<ClaimDTO> rejectClaim(@PathVariable Long id, @RequestParam String reason) {
        return ResponseEntity.ok(claimService.rejectClaim(id, reason));
    }

    @PreAuthorize("hasAnyRole('POLICYHOLDER', 'CLAIM_OFFICER', 'ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<ClaimDTO> getClaimById(@PathVariable Long id) {
        ClaimDTO claim = claimService.getClaimById(id);
        return claim != null ? ResponseEntity.ok(claim) : ResponseEntity.notFound().build();
    }

    @PreAuthorize("hasAnyRole('POLICYHOLDER', 'ADMIN')")
    @GetMapping("/policy-application/{policyApplicationId}")
    public ResponseEntity<List<ClaimDTO>> getClaimsByPolicyApplication(@PathVariable Long policyApplicationId) {
        return ResponseEntity.ok(claimService.getClaimsByPolicyApplication(policyApplicationId));
    }

    @PreAuthorize("hasRole('CLAIM_OFFICER')")
    @GetMapping("/claim-officer/{claimOfficerId}")
    public ResponseEntity<List<ClaimDTO>> getClaimsByClaimOfficer(@PathVariable Long claimOfficerId) {
        return ResponseEntity.ok(claimService.getClaimsByClaimOfficer(claimOfficerId));
    }

    @PreAuthorize("hasRole('POLICYHOLDER')")
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ClaimDTO>> getClaimsByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(claimService.getClaimsByUserId(userId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ClaimDTO> updateClaim(@PathVariable Long id, @RequestBody ClaimDTO claim) {
        ClaimDTO updated = claimService.updateClaim(id, claim);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }
    @PreAuthorize("hasRole('POLICYHOLDER')")
    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<ClaimDTO> createClaim(
            @RequestPart("claim") ClaimDTO claim,
            @RequestPart(value = "documents", required = false) List<org.springframework.web.multipart.MultipartFile> documents) {
        return ResponseEntity.ok(claimService.createClaim(claim, documents));
    }
}
