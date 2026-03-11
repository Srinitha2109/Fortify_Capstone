package com.example.comproject.repository;

import com.example.comproject.entity.Claim;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ClaimRepository extends JpaRepository<Claim, Long> {
    Optional<Claim> findByClaimNumber(String claimNumber);
    List<Claim> findByPolicyApplicationId(Long policyApplicationId);
    List<Claim> findByClaimOfficerId(Long claimOfficerId);

    List<Claim> findByClaimOfficerIdOrPolicyApplicationClaimOfficerIdOrPolicyApplicationBusinessProfileClaimOfficerId(
        Long id1, Long id2, Long id3
    );
}
