package com.example.comproject.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "business_profiles")
public class BusinessProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    private String businessName;
    private String industry;
    private BigDecimal annualRevenue;
    private Integer employeeCount;
    private String city;
    private Boolean isProfileCompleted;

    @ManyToOne
    @JoinColumn(name = "agent_id")
    private Agent agent;

    @ManyToOne
    @JoinColumn(name = "claim_officer_id")
    private ClaimOfficer claimOfficer;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getBusinessName() { return businessName; }
    public void setBusinessName(String businessName) { this.businessName = businessName; }
    public String getIndustry() { return industry; }
    public void setIndustry(String industry) { this.industry = industry; }
    public BigDecimal getAnnualRevenue() { return annualRevenue; }
    public void setAnnualRevenue(BigDecimal annualRevenue) { this.annualRevenue = annualRevenue; }
    public Integer getEmployeeCount() { return employeeCount; }
    public void setEmployeeCount(Integer employeeCount) { this.employeeCount = employeeCount; }
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    public Boolean getIsProfileCompleted() { return isProfileCompleted; }
    public void setIsProfileCompleted(Boolean isProfileCompleted) { this.isProfileCompleted = isProfileCompleted; }
    public Agent getAgent() { return agent; }
    public void setAgent(Agent agent) { this.agent = agent; }
    public ClaimOfficer getClaimOfficer() { return claimOfficer; }
    public void setClaimOfficer(ClaimOfficer claimOfficer) { this.claimOfficer = claimOfficer; }
}
