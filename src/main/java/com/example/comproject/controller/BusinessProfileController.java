package com.example.comproject.controller;

import com.example.comproject.dto.BusinessProfileDTO;
import com.example.comproject.service.BusinessProfileService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/business-profiles")
public class BusinessProfileController {
    private final BusinessProfileService businessProfileService;

    public BusinessProfileController(BusinessProfileService businessProfileService) {
        this.businessProfileService = businessProfileService;
    }

    @GetMapping
    public ResponseEntity<java.util.List<BusinessProfileDTO>> getAllProfiles() {
        return ResponseEntity.ok(businessProfileService.getAllProfiles());
    }

    @PostMapping
    public ResponseEntity<BusinessProfileDTO> createProfile(@RequestBody BusinessProfileDTO profile) {
        return ResponseEntity.ok(businessProfileService.createProfile(profile));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<BusinessProfileDTO> getProfileByUserId(@PathVariable Long userId) {
        BusinessProfileDTO profile = businessProfileService.getProfileByUserId(userId);
        return profile != null ? ResponseEntity.ok(profile) : ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<BusinessProfileDTO> updateProfile(@PathVariable Long id, @RequestBody BusinessProfileDTO profile) {
        BusinessProfileDTO updated = businessProfileService.updateProfile(id, profile);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}/assign-staff")
    public ResponseEntity<BusinessProfileDTO> assignStaff(@PathVariable Long id,
                                                           @RequestParam Long agentId,
                                                           @RequestParam Long claimOfficerId) {
        return ResponseEntity.ok(businessProfileService.assignStaff(id, agentId, claimOfficerId));
    }
}
