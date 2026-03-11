package com.example.comproject.controller;

import com.example.comproject.dto.PolicyApplicationDTO;
import com.example.comproject.dto.PolicyDTO;
import com.example.comproject.dto.PolicyFilterRequestDTO;
import com.example.comproject.service.PolicyApplicationService;
import com.example.comproject.service.PolicyService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/policyholder")
public class PolicyholderController {
    private final PolicyService policyService;
    private final PolicyApplicationService policyApplicationService;

    public PolicyholderController(PolicyService policyService, PolicyApplicationService policyApplicationService) {
        this.policyService = policyService;
        this.policyApplicationService = policyApplicationService;
    }

    @PostMapping("/policies/search")
    public ResponseEntity<List<PolicyDTO>> searchPolicies(
        @RequestBody PolicyFilterRequestDTO filter) {
        return ResponseEntity.ok(policyService.filterPolicies(filter));
    }
    
    // @GetMapping("/policies")
    // public ResponseEntity<List<PolicyDTO>> getAllAvailablePolicies() {
    //     return ResponseEntity.ok(policyService.getActivePolicies());
    // }

    // @GetMapping("/policies/insurance-type/{insuranceTypeId}")
    // public ResponseEntity<List<PolicyDTO>> getPoliciesByType(@PathVariable Long insuranceTypeId) {
    //     return ResponseEntity.ok(policyService.getPoliciesByInsuranceType(insuranceTypeId));
    // }

    @GetMapping("/policies/{id}")
    public ResponseEntity<PolicyDTO> getPolicyDetails(@PathVariable Long id) {
        PolicyDTO policy = policyService.getPolicyById(id);
        return policy != null ? ResponseEntity.ok(policy) : ResponseEntity.notFound().build();
    }

    @PostMapping("/apply")
    public ResponseEntity<PolicyApplicationDTO> applyForPolicy(@RequestBody PolicyApplicationDTO application) {
        return ResponseEntity.ok(policyApplicationService.createApplication(application));
    }

    @GetMapping("/my-applications/{userId}")
    public ResponseEntity<List<PolicyApplicationDTO>> getMyApplications(@PathVariable Long userId) {
        return ResponseEntity.ok(policyApplicationService.getApplicationsByUserId(userId));
    }
}
