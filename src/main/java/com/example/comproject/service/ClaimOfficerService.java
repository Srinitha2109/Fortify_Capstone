package com.example.comproject.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.comproject.entity.ClaimOfficer;
import com.example.comproject.repository.ClaimOfficerRepository;

@Service
public class ClaimOfficerService {
    private final ClaimOfficerRepository claimOfficerRepository;

    public ClaimOfficerService(ClaimOfficerRepository claimOfficerRepository) {
        this.claimOfficerRepository = claimOfficerRepository;
    }

    public ClaimOfficer createClaimOfficer(ClaimOfficer claimOfficer) {
        claimOfficer.setEmployeeCode(generateEmployeeCode());
        return claimOfficerRepository.save(claimOfficer);
    }

    private String generateEmployeeCode() {
        long count = claimOfficerRepository.count() + 1;
        return String.format("EMP-%04d", count);
    }

    public ClaimOfficer getClaimOfficerById(Long id) {
        return claimOfficerRepository.findById(id).orElse(null);
    }

    public ClaimOfficer getClaimOfficerByUserId(Long userId) {
        return claimOfficerRepository.findByUserId(userId).orElse(null);
    }

    public List<ClaimOfficer> getAllClaimOfficers() {
        return claimOfficerRepository.findAll();
    }

    public List<ClaimOfficer> getAvailableClaimOfficersBySpecialization(String specializationStr) {
        try {
            ClaimOfficer.Specialization spec = ClaimOfficer.Specialization.valueOf(specializationStr.toUpperCase());
            return claimOfficerRepository.findBySpecializationAndBusinessProfilesIsEmpty(spec);
        } catch (IllegalArgumentException e) {
            // Return all available claim officers if specialized is unknown
            return claimOfficerRepository.findByBusinessProfilesIsEmpty();
        }
    }

    public List<ClaimOfficer> getAvailableClaimOfficers() {
        return claimOfficerRepository.findByBusinessProfilesIsEmpty();
    }
}
