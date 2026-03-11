package com.example.comproject.service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import com.example.comproject.dto.PolicyDTO;
import com.example.comproject.dto.PolicyFilterRequestDTO;
import com.example.comproject.entity.InsuranceType;
import com.example.comproject.entity.Policy;
import com.example.comproject.entity.User;
import com.example.comproject.repository.PolicyRepository;

@Service
public class PolicyService {
    private final PolicyRepository policyRepository;
    private final AppNotificationService notificationService;

    public PolicyService(PolicyRepository policyRepository,
            AppNotificationService notificationService) {
        this.policyRepository = policyRepository;
        this.notificationService = notificationService;
    }

    public PolicyDTO createPolicy(PolicyDTO dto) {
        InsuranceType insuranceType = InsuranceType.valueOf(dto.getInsuranceType());

        if (dto.getMinCoverageAmount().compareTo(dto.getMaxCoverageAmount()) >= 0) {
            throw new RuntimeException("Min coverage amount must be less than max coverage amount");
        }

        Policy policy = new Policy();
        policy.setPolicyName(dto.getPolicyName());
        policy.setInsuranceType(insuranceType);
        policy.setDescription(dto.getDescription());
        policy.setMinCoverageAmount(dto.getMinCoverageAmount());
        policy.setMaxCoverageAmount(dto.getMaxCoverageAmount());
        policy.setBasePremium(dto.getBasePremium());
        policy.setDurationMonths(dto.getDurationMonths());
        policy.setIsActive(true);
        policy.setPolicyNumber(generatePolicyNumber(insuranceType.getDisplayName()));

        Policy saved = policyRepository.save(policy);

        // Notify all active policyholders about the new policy
        notificationService.notifyAllByRole(
                User.Role.POLICYHOLDER,
                "A new policy \"" + saved.getPolicyName() + "\" is now available. Browse it in the Policies section!",
                "Policies");

        return toDTO(saved);
    }

    public PolicyDTO updatePolicy(Long id, PolicyDTO dto) {
        Policy policy = policyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Policy not found with id: " + id));

        InsuranceType insuranceType = InsuranceType.valueOf(dto.getInsuranceType());

        if (dto.getMinCoverageAmount().compareTo(dto.getMaxCoverageAmount()) >= 0) {
            throw new RuntimeException("Min coverage amount must be less than max coverage amount");
        }

        policy.setPolicyName(dto.getPolicyName());
        policy.setInsuranceType(insuranceType);
        policy.setDescription(dto.getDescription());
        policy.setMinCoverageAmount(dto.getMinCoverageAmount());
        policy.setMaxCoverageAmount(dto.getMaxCoverageAmount());
        policy.setBasePremium(dto.getBasePremium());
        policy.setDurationMonths(dto.getDurationMonths());
        policy.setIsActive(dto.getIsActive());

        // We typically don't change policy number on update unless business rules
        // require it

        Policy saved = policyRepository.save(policy);
        return toDTO(saved);
    }

    private String generatePolicyNumber(String typeName) {
        String prefix = typeName
                .replace(" ", "")
                .substring(0, Math.min(4, typeName.replace(" ", "").length()))
                .toUpperCase();

        long count = policyRepository.count() + 1;
        return String.format("POL-%s-%04d", prefix, count);
    }

    public PolicyDTO getPolicyById(Long id) {
        return policyRepository.findById(id).map(this::toDTO).orElse(null);
    }

    public List<PolicyDTO> getAllPolicies() {
        return policyRepository.findAll().stream().map(this::toDTO).collect(java.util.stream.Collectors.toList());
    }

    public List<PolicyDTO> getActivePolicies() {
        return policyRepository.findByIsActive(true).stream().map(this::toDTO)
                .collect(java.util.stream.Collectors.toList());
    }

    public List<PolicyDTO> getPoliciesByInsuranceType(String insuranceType) {
        InsuranceType type = InsuranceType.valueOf(insuranceType);
        return policyRepository.findByInsuranceType(type).stream().map(this::toDTO)
                .collect(java.util.stream.Collectors.toList());
    }

    public List<PolicyDTO> filterPolicies(PolicyFilterRequestDTO filter) {

        Specification<Policy> spec = (root, query, cb) -> {
            List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();

            // Always only active policies
            predicates.add(cb.isTrue(root.get("isActive")));

            // Insurance types filter
            if (filter.getInsuranceTypes() != null && !filter.getInsuranceTypes().isEmpty()) {
                predicates.add(root.get("insuranceType").get("typeName").in(filter.getInsuranceTypes()));
            }

            // Premium range filter
            if (filter.getPremiumRange() != null) {
                if (filter.getPremiumRange().getMin() != null)
                    predicates.add(cb.greaterThanOrEqualTo(root.get("basePremium"), filter.getPremiumRange().getMin()));
                if (filter.getPremiumRange().getMax() != null)
                    predicates.add(cb.lessThanOrEqualTo(root.get("basePremium"), filter.getPremiumRange().getMax()));
            }

            // Coverage range filter
            if (filter.getCoverageRange() != null) {
                if (filter.getCoverageRange().getMin() != null)
                    predicates.add(
                            cb.greaterThanOrEqualTo(root.get("maxCoverageAmount"), filter.getCoverageRange().getMin()));
                if (filter.getCoverageRange().getMax() != null)
                    predicates.add(
                            cb.lessThanOrEqualTo(root.get("maxCoverageAmount"), filter.getCoverageRange().getMax()));
            }

            // Duration filter
            if (filter.getDuration() != null && !filter.getDuration().isEmpty()) {
                predicates.add(root.get("durationMonths").in(filter.getDuration()));
            }

            // Keywords filter — searches policyName and description
            if (filter.getKeywords() != null && !filter.getKeywords().isEmpty()) {
                List<jakarta.persistence.criteria.Predicate> keywordPredicates = filter.getKeywords().stream()
                        .map(keyword -> cb.or(
                                cb.like(cb.lower(root.get("policyName")), "%" + keyword.toLowerCase() + "%"),
                                cb.like(cb.lower(root.get("description")), "%" + keyword.toLowerCase() + "%")))
                        .toList();
                predicates.add(cb.or(keywordPredicates.toArray(new jakarta.persistence.criteria.Predicate[0])));
            }

            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };

        // Sort
        Sort sort = Sort.unsorted();
        if (filter.getSort() != null && filter.getSort().getField() != null) {
            sort = "DESC".equalsIgnoreCase(filter.getSort().getDirection())
                    ? Sort.by(filter.getSort().getField()).descending()
                    : Sort.by(filter.getSort().getField()).ascending();
        }

        return policyRepository.findAll(spec, sort)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    private PolicyDTO toDTO(Policy policy) {
        PolicyDTO dto = new PolicyDTO();
        dto.setId(policy.getId());
        dto.setPolicyNumber(policy.getPolicyNumber());
        dto.setPolicyName(policy.getPolicyName());
        dto.setInsuranceType(policy.getInsuranceType().name());
        dto.setInsuranceTypeDisplayName(policy.getInsuranceType().getDisplayName());
        dto.setDescription(policy.getDescription());
        dto.setMinCoverageAmount(policy.getMinCoverageAmount());
        dto.setMaxCoverageAmount(policy.getMaxCoverageAmount());
        dto.setBasePremium(policy.getBasePremium());
        dto.setDurationMonths(policy.getDurationMonths());
        dto.setIsActive(policy.getIsActive());
        return dto;
    }
}
