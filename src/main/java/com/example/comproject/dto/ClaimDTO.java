package com.example.comproject.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import com.example.comproject.entity.Claim;

public class ClaimDTO {

    private Long id;
    private String claimNumber;

    @NotNull(message = "Policy Application ID is required")
    private Long policyApplicationId;

    private String policyNumber;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Claim amount is required")
    @Positive(message = "Claim amount must be positive")
    private BigDecimal claimAmount;

    @NotNull(message = "Incident date is required")
    private java.time.LocalDate incidentDate;

    @NotBlank(message = "Incident location is required")
    private String incidentLocation;

    private Claim.ClaimStatus status;
    private Long claimOfficerId;
    private String rejectionReason;

    private String policyholderName;
    private String planName;


    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getClaimNumber() { return claimNumber; }
    public void setClaimNumber(String claimNumber) { this.claimNumber = claimNumber; }
    public Long getPolicyApplicationId() { return policyApplicationId; }
    public void setPolicyApplicationId(Long policyApplicationId) { this.policyApplicationId = policyApplicationId; }
    public String getPolicyNumber() { return policyNumber; }
    public void setPolicyNumber(String policyNumber) { this.policyNumber = policyNumber; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public BigDecimal getClaimAmount() { return claimAmount; }
    public void setClaimAmount(BigDecimal claimAmount) { this.claimAmount = claimAmount; }
    public Claim.ClaimStatus getStatus() { return status; }
    public void setStatus(Claim.ClaimStatus status) { this.status = status; }
    public java.time.LocalDate getIncidentDate() { return incidentDate; }
    public void setIncidentDate(java.time.LocalDate incidentDate) { this.incidentDate = incidentDate; }
    public String getIncidentLocation() { return incidentLocation; }
    public void setIncidentLocation(String incidentLocation) { this.incidentLocation = incidentLocation; }
    public Long getClaimOfficerId() { return claimOfficerId; }
    public void setClaimOfficerId(Long claimOfficerId) { this.claimOfficerId = claimOfficerId; }
    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }
    public String getPolicyholderName() { return policyholderName; }
    public void setPolicyholderName(String policyholderName) { this.policyholderName = policyholderName; }
    public String getPlanName() { return planName; }
    public void setPlanName(String planName) { this.planName = planName; }

}
