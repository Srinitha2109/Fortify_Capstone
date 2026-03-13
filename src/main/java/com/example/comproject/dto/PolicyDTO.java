package com.example.comproject.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class PolicyDTO {
    private Long id;
    private String policyNumber;

    @NotBlank(message = "Policy name is required")
    private String policyName;

    @NotBlank(message = "Insurance type is required")
    private String insuranceType;

    private String insuranceTypeDisplayName;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Minimum coverage amount is required")
    private BigDecimal minCoverageAmount;

    @NotNull(message = "Maximum coverage amount is required")
    private BigDecimal maxCoverageAmount;

    @NotNull(message = "Base premium is required")
    private BigDecimal basePremium;

    @NotNull(message = "Duration in months is required")
    private Integer durationMonths;
    private Boolean isActive = true;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getPolicyNumber() { return policyNumber; }
    public void setPolicyNumber(String policyNumber) { this.policyNumber = policyNumber; }
    public String getPolicyName() { return policyName; }
    public void setPolicyName(String policyName) { this.policyName = policyName; }
    public String getInsuranceType() { return insuranceType; }
    public void setInsuranceType(String insuranceType) { this.insuranceType = insuranceType; }
    public String getInsuranceTypeDisplayName() { return insuranceTypeDisplayName; }
    public void setInsuranceTypeDisplayName(String insuranceTypeDisplayName) { this.insuranceTypeDisplayName = insuranceTypeDisplayName; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public BigDecimal getMinCoverageAmount() { return minCoverageAmount; }
    public void setMinCoverageAmount(BigDecimal minCoverageAmount) { this.minCoverageAmount = minCoverageAmount; }
    public BigDecimal getMaxCoverageAmount() { return maxCoverageAmount; }
    public void setMaxCoverageAmount(BigDecimal maxCoverageAmount) { this.maxCoverageAmount = maxCoverageAmount; }
    public BigDecimal getBasePremium() { return basePremium; }
    public void setBasePremium(BigDecimal basePremium) { this.basePremium = basePremium; }
    public Integer getDurationMonths() { return durationMonths; }
    public void setDurationMonths(Integer durationMonths) { this.durationMonths = durationMonths; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
}
