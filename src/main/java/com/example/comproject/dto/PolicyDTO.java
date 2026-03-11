package com.example.comproject.dto;

import java.math.BigDecimal;

public class PolicyDTO {
    private Long id;
    private String policyNumber;
    private String policyName;
    private String insuranceType;
    private String insuranceTypeDisplayName;

    private String description;
    private BigDecimal minCoverageAmount;
    private BigDecimal maxCoverageAmount;
    private BigDecimal basePremium;
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
