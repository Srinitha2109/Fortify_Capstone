package com.example.comproject.repository;

import com.example.comproject.entity.InsuranceType;
import com.example.comproject.entity.Policy;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;

public interface PolicyRepository extends JpaRepository<Policy, Long> ,JpaSpecificationExecutor<Policy> {
    Optional<Policy> findByPolicyNumber(String policyNumber);
    List<Policy> findByIsActive(Boolean isActive);
    List<Policy> findByInsuranceType(InsuranceType insuranceType);

  
    // // Search by insurance type name OR policy name — case insensitive
    // List<Policy> findByIsActiveAndInsuranceType_TypeNameContainingIgnoreCaseOrIsActiveAndPolicyNameContainingIgnoreCase(
    //     Boolean isActive1, String typeName,
    //     Boolean isActive2, String policyName
    // );
}
