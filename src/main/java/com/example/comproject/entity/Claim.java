package com.example.comproject.entity;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "claims")
public class Claim {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String claimNumber;

    @ManyToOne
    @JoinColumn(name = "policy_application_id")
    private PolicyApplication policyApplication;

    @Column(columnDefinition = "TEXT")
    private String description;

    private BigDecimal claimAmount;

    private java.time.LocalDate incidentDate;
    private String incidentLocation;

    @Enumerated(EnumType.STRING)
    private ClaimStatus status;

    @ManyToOne
    @JoinColumn(name = "claim_officer_id")
    private ClaimOfficer claimOfficer;

    @Column(columnDefinition = "TEXT")
    private String rejectionReason;

    public enum ClaimStatus {
        SUBMITTED, ASSIGNED, UNDER_INVESTIGATION, APPROVED, PARTIALLY_APPROVED, REJECTED, SETTLED
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getClaimNumber() { return claimNumber; }
    public void setClaimNumber(String claimNumber) { this.claimNumber = claimNumber; }
    public PolicyApplication getPolicyApplication() { return policyApplication; }
    public void setPolicyApplication(PolicyApplication policyApplication) { this.policyApplication = policyApplication; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public BigDecimal getClaimAmount() { return claimAmount; }
    public void setClaimAmount(BigDecimal claimAmount) { this.claimAmount = claimAmount; }
    public ClaimStatus getStatus() { return status; }
    public void setStatus(ClaimStatus status) { this.status = status; }
    public java.time.LocalDate getIncidentDate() { return incidentDate; }
    public void setIncidentDate(java.time.LocalDate incidentDate) { this.incidentDate = incidentDate; }
    public String getIncidentLocation() { return incidentLocation; }
    public void setIncidentLocation(String incidentLocation) { this.incidentLocation = incidentLocation; }
    public ClaimOfficer getClaimOfficer() { return claimOfficer; }
    public void setClaimOfficer(ClaimOfficer claimOfficer) { this.claimOfficer = claimOfficer; }
    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }
}
