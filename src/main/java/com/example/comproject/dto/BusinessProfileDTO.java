package com.example.comproject.dto;


public class BusinessProfileDTO {
    private Long id;
    private Long userId;
    private String userFullName;
    private String businessName;
    private String industry;
    private java.math.BigDecimal annualRevenue;
    private Integer employeeCount;
    private String city;
    private Boolean isProfileCompleted;
    private Long agentId;
    private String agentName;
    private Long claimOfficerId;
    private String claimOfficerName;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getUserFullName() { return userFullName; }
    public void setUserFullName(String userFullName) { this.userFullName = userFullName; }
    public String getBusinessName() { return businessName; }
    public void setBusinessName(String businessName) { this.businessName = businessName; }
    public String getIndustry() { return industry; }
    public void setIndustry(String industry) { this.industry = industry; }
    public java.math.BigDecimal getAnnualRevenue() { return annualRevenue; }
    public void setAnnualRevenue(java.math.BigDecimal annualRevenue) { this.annualRevenue = annualRevenue; }
    public Integer getEmployeeCount() { return employeeCount; }
    public void setEmployeeCount(Integer employeeCount) { this.employeeCount = employeeCount; }
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    public Boolean getIsProfileCompleted() { return isProfileCompleted; }
    public void setIsProfileCompleted(Boolean isProfileCompleted) { this.isProfileCompleted = isProfileCompleted; }
    public Long getAgentId() { return agentId; }
    public void setAgentId(Long agentId) { this.agentId = agentId; }
    public String getAgentName() { return agentName; }
    public void setAgentName(String agentName) { this.agentName = agentName; }
    public Long getClaimOfficerId() { return claimOfficerId; }
    public void setClaimOfficerId(Long claimOfficerId) { this.claimOfficerId = claimOfficerId; }
    public String getClaimOfficerName() { return claimOfficerName; }
    public void setClaimOfficerName(String claimOfficerName) { this.claimOfficerName = claimOfficerName; }
}
