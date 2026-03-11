package com.example.comproject.dto;

import com.example.comproject.entity.ClaimOfficer;

public class ClaimOfficerDTO {
    private Long id;
    private Long userId;
    private String employeeCode;
    private String region;
    private ClaimOfficer.Specialization specialization;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getEmployeeCode() { return employeeCode; }
    public void setEmployeeCode(String employeeCode) { this.employeeCode = employeeCode; }
    public String getRegion() { return region; }
    public void setRegion(String region) { this.region = region; }
    public ClaimOfficer.Specialization getSpecialization() { return specialization; }
    public void setSpecialization(ClaimOfficer.Specialization specialization) { this.specialization = specialization; }
}
