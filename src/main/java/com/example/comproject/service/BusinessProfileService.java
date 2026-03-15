package com.example.comproject.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.comproject.dto.BusinessProfileDTO;
import com.example.comproject.entity.Agent;
import com.example.comproject.entity.BusinessProfile;
import com.example.comproject.entity.ClaimOfficer;
import com.example.comproject.entity.User;
import com.example.comproject.repository.AgentRepository;
import com.example.comproject.repository.BusinessProfileRepository;
import com.example.comproject.repository.ClaimOfficerRepository;
import com.example.comproject.repository.UserRepository;

@Service
public class BusinessProfileService {
    private final BusinessProfileRepository businessProfileRepository;
    private final UserRepository userRepository;
    private final AgentRepository agentRepository;
    private final ClaimOfficerRepository claimOfficerRepository;

    public BusinessProfileService(BusinessProfileRepository businessProfileRepository,
                                   UserRepository userRepository,
                                   AgentRepository agentRepository,
                                   ClaimOfficerRepository claimOfficerRepository) {
        this.businessProfileRepository = businessProfileRepository;
        this.userRepository = userRepository;
        this.agentRepository = agentRepository;
        this.claimOfficerRepository = claimOfficerRepository;
    }

    public BusinessProfileDTO createProfile(BusinessProfileDTO dto) {
        BusinessProfile profile = new BusinessProfile();
        profile.setUser(userRepository.findById(dto.getUserId()).orElseThrow());
        profile.setBusinessName(dto.getBusinessName());
        profile.setIndustry(dto.getIndustry());
        profile.setAnnualRevenue(dto.getAnnualRevenue());
        profile.setEmployeeCount(dto.getEmployeeCount());
        profile.setCity(dto.getCity());
        profile.setIsProfileCompleted(dto.getIsProfileCompleted());
        return toDTO(businessProfileRepository.save(profile));
    }

    public BusinessProfileDTO getProfileByUserId(Long userId) {
        System.out.println("DEBUG: getProfileByUserId called with userId=" + userId);
        return businessProfileRepository.findByUserId(userId)
                .map(profile -> {
                    System.out.println("DEBUG: Found existing profile for userId=" + userId + ", profileId=" + profile.getId());
                    System.out.println("DEBUG: Profile agent=" + (profile.getAgent() != null ? profile.getAgent().getId() : "NULL"));
                    return toDTO(profile);
                })
                .orElseGet(() -> {
                    System.out.println("DEBUG: No profile found for userId=" + userId + ", attempting auto-creation...");
                    User user = userRepository.findById(userId).orElse(null);
                    if (user != null && user.getRole() == User.Role.POLICYHOLDER) {
                        System.out.println("DEBUG: User found: " + user.getFullName() + ", role=" + user.getRole());
                        System.out.println("DEBUG: User business data - name=" + user.getBusinessName() + ", industry=" + user.getIndustry());
                        // Auto-create profile if missing but user data exists
                        BusinessProfile profile = new BusinessProfile();
                        profile.setUser(user);
                        profile.setBusinessName(user.getBusinessName());
                        profile.setIndustry(user.getIndustry());
                        if (user.getAnnualRevenue() != null) {
                            profile.setAnnualRevenue(java.math.BigDecimal.valueOf(user.getAnnualRevenue()));
                        }
                        profile.setEmployeeCount(user.getEmployeeCount());
                        profile.setCity(user.getCity());
                        profile.setIsProfileCompleted(true);
                        BusinessProfile saved = businessProfileRepository.save(profile);
                        System.out.println("DEBUG: Auto-created profile with id=" + saved.getId());
                        return toDTO(saved);
                    }
                    System.out.println("DEBUG: Could not auto-create profile. User is null or not POLICYHOLDER.");
                    return null;
                });
    }

    public List<BusinessProfileDTO> getAllProfiles() {
        return businessProfileRepository.findAll().stream()
                .map(this::toDTO).collect(Collectors.toList());
    }

    public BusinessProfileDTO getProfileById(Long id) {
        return businessProfileRepository.findById(id).map(this::toDTO).orElse(null);
    }

    public BusinessProfileDTO updateProfile(Long id, BusinessProfileDTO dto) {
        if (businessProfileRepository.existsById(id)) {
            BusinessProfile profile = businessProfileRepository.findById(id).orElseThrow();
            profile.setBusinessName(dto.getBusinessName());
            profile.setIndustry(dto.getIndustry());
            profile.setAnnualRevenue(dto.getAnnualRevenue());
            profile.setEmployeeCount(dto.getEmployeeCount());
            profile.setCity(dto.getCity());
            profile.setIsProfileCompleted(dto.getIsProfileCompleted());
            return toDTO(businessProfileRepository.save(profile));
        }
        return null;
    }

    /** Admin assigns an agent and claim officer to a policyholder's business profile */
    public BusinessProfileDTO assignStaff(Long profileId, Long agentId, Long claimOfficerId) {
        BusinessProfile profile = businessProfileRepository.findById(profileId)
                .orElseThrow(() -> new RuntimeException("Business profile not found"));

        Agent agent = agentRepository.findById(agentId)
                .orElseThrow(() -> new RuntimeException("Agent not found"));

        ClaimOfficer claimOfficer = claimOfficerRepository.findById(claimOfficerId)
                .orElseThrow(() -> new RuntimeException("Claim officer not found"));

        profile.setAgent(agent);
        profile.setClaimOfficer(claimOfficer);
        return toDTO(businessProfileRepository.save(profile));
    }

    private BusinessProfileDTO toDTO(BusinessProfile profile) {
        BusinessProfileDTO dto = new BusinessProfileDTO();
        dto.setId(profile.getId());
        dto.setUserId(profile.getUser().getId());
        dto.setUserFullName(profile.getUser().getFullName());
        dto.setBusinessName(profile.getBusinessName());
        dto.setIndustry(profile.getIndustry());
        dto.setAnnualRevenue(profile.getAnnualRevenue());
        dto.setEmployeeCount(profile.getEmployeeCount());
        dto.setCity(profile.getCity());
        dto.setIsProfileCompleted(profile.getIsProfileCompleted());
        if (profile.getAgent() != null) {
            dto.setAgentId(profile.getAgent().getId());
            dto.setAgentName(profile.getAgent().getUser().getFullName());
        }
        if (profile.getClaimOfficer() != null) {
            dto.setClaimOfficerId(profile.getClaimOfficer().getId());
            dto.setClaimOfficerName(profile.getClaimOfficer().getUser().getFullName());
        }
        return dto;
    }
}
