package com.example.comproject.repository;

import com.example.comproject.entity.PolicyDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PolicyDocumentRepository extends JpaRepository<PolicyDocument, Long> {
    List<PolicyDocument> findByPolicyApplicationId(Long policyApplicationId);
}
