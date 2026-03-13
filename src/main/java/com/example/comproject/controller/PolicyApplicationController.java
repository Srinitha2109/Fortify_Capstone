package com.example.comproject.controller;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.comproject.dto.PolicyApplicationDTO;
import com.example.comproject.entity.PolicyApplication;
import com.example.comproject.service.PolicyApplicationService;

@RestController
@RequestMapping("/api/policy-applications")
public class PolicyApplicationController {
    private final PolicyApplicationService policyApplicationService;

    public PolicyApplicationController(PolicyApplicationService policyApplicationService) {
        this.policyApplicationService = policyApplicationService;
    }

    @PreAuthorize("hasRole('POLICYHOLDER')")
    @PostMapping
    public ResponseEntity<PolicyApplicationDTO> createApplication(@RequestBody PolicyApplicationDTO application) {
        return ResponseEntity.ok(policyApplicationService.createApplication(application));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/all")
    public ResponseEntity<List<PolicyApplicationDTO>> getAllApplications() {
        return ResponseEntity.ok(policyApplicationService.getAllApplications());
    }

    @PreAuthorize("hasAnyRole('POLICYHOLDER', 'ADMIN')")
    @PostMapping("/calculate-premium")
    public ResponseEntity<BigDecimal> calculatePremiumPreview(@RequestBody PremiumRequest request) {
        return ResponseEntity.ok(policyApplicationService.calculatePremiumPreview(
                request.getPlanId(), request.getCoverageAmount(), request.getBusinessProfileId(),
                request.getPaymentPlan()));
    }

    @PreAuthorize("hasAnyRole('POLICYHOLDER', 'AGENT', 'ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<PolicyApplicationDTO> getApplicationById(@PathVariable Long id) {
        PolicyApplicationDTO application = policyApplicationService.getApplicationById(id);
        return application != null ? ResponseEntity.ok(application) : ResponseEntity.notFound().build();
    }

    @PreAuthorize("hasAnyRole('POLICYHOLDER', 'ADMIN')")
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<PolicyApplicationDTO>> getApplicationsByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(policyApplicationService.getApplicationsByUserId(userId));
    }

    @PreAuthorize("hasRole('AGENT')")
    @GetMapping("/agent/{agentId}")
    public ResponseEntity<List<PolicyApplicationDTO>> getApplicationsByAgentId(@PathVariable Long agentId) {
        return ResponseEntity.ok(policyApplicationService.getApplicationsByAgentId(agentId));
    }

    @PreAuthorize("hasAnyRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<PolicyApplicationDTO> updateApplication(@PathVariable Long id,
            @RequestBody PolicyApplicationDTO application) {
        PolicyApplicationDTO updated = policyApplicationService.updateApplication(id, application);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/assign-staff")
    public ResponseEntity<PolicyApplicationDTO> assignStaff(
            @PathVariable Long id,
            @RequestParam Long agentId,
            @RequestParam Long claimOfficerId) {
        return ResponseEntity.ok(policyApplicationService.assignStaff(id, agentId, claimOfficerId));
    }

    @PreAuthorize("hasRole('AGENT')")
    @PutMapping("/{id}/approve")
    public ResponseEntity<PolicyApplicationDTO> approveApplication(@PathVariable Long id) {
        return ResponseEntity.ok(policyApplicationService.approveApplication(id));
    }

    @PreAuthorize("hasRole('AGENT')")
    @PutMapping("/{id}/reject")
    public ResponseEntity<PolicyApplicationDTO> rejectApplication(@PathVariable Long id, @RequestParam String reason) {
        return ResponseEntity.ok(policyApplicationService.rejectApplication(id, reason));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/activate")
    public ResponseEntity<PolicyApplicationDTO> activatePolicy(@PathVariable Long id) {
        PolicyApplicationDTO application = policyApplicationService.getApplicationById(id);
        if (application == null) {
            return ResponseEntity.notFound().build();
        }
        if (!"APPROVED".equals(application.getStatus().name())) {
            return ResponseEntity.badRequest().build();
        }
        application.setStatus(PolicyApplication.ApplicationStatus.ACTIVE);
        return ResponseEntity.ok(policyApplicationService.updateApplication(id, application));
    }

    public static class PremiumRequest {
        private Long planId;
        private BigDecimal coverageAmount;
        private Long businessProfileId;
        private PolicyApplication.PaymentPlan paymentPlan;

        public Long getPlanId() {
            return planId;
        }

        public void setPlanId(Long planId) {
            this.planId = planId;
        }

        public BigDecimal getCoverageAmount() {
            return coverageAmount;
        }

        public void setCoverageAmount(BigDecimal coverageAmount) {
            this.coverageAmount = coverageAmount;
        }

        public Long getBusinessProfileId() {
            return businessProfileId;
        }

        public void setBusinessProfileId(Long businessProfileId) {
            this.businessProfileId = businessProfileId;
        }

        public PolicyApplication.PaymentPlan getPaymentPlan() {
            return paymentPlan;
        }

        public void setPaymentPlan(PolicyApplication.PaymentPlan paymentPlan) {
            this.paymentPlan = paymentPlan;
        }
    }
}
