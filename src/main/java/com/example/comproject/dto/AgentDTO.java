package com.example.comproject.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import com.example.comproject.entity.Agent;
import java.math.BigDecimal;

public class AgentDTO {
    private Long id;
    private Long userId;

    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotBlank(message = "Agent code is required")
    private String agentCode;

    @NotBlank(message = "License number is required")
    private String licenseNumber;

    private String territory;

    @NotNull(message = "Specialization is required")
    private Agent.Specialization specialization;
    private BigDecimal commissionRate;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getAgentCode() { return agentCode; }
    public void setAgentCode(String agentCode) { this.agentCode = agentCode; }
    public String getLicenseNumber() { return licenseNumber; }
    public void setLicenseNumber(String licenseNumber) { this.licenseNumber = licenseNumber; }
    public String getTerritory() { return territory; }
    public void setTerritory(String territory) { this.territory = territory; }
    public Agent.Specialization getSpecialization() { return specialization; }
    public void setSpecialization(Agent.Specialization specialization) { this.specialization = specialization; }
    public BigDecimal getCommissionRate() { return commissionRate; }
    public void setCommissionRate(BigDecimal commissionRate) { this.commissionRate = commissionRate; }
}
