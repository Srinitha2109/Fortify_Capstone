package com.example.comproject.repository;

import com.example.comproject.entity.PolicyApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface PolicyApplicationRepository extends JpaRepository<PolicyApplication, Long> {
    Optional<PolicyApplication> findByPolicyNumber(String policyNumber);
    List<PolicyApplication> findByUserId(Long userId);
    List<PolicyApplication> findByAgentId(Long agentId);
}
