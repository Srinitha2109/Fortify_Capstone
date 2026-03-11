package com.example.comproject.service;

import com.example.comproject.entity.PolicyDocument;
import com.example.comproject.repository.PolicyDocumentRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class PolicyDocumentService {
    private final PolicyDocumentRepository policyDocumentRepository;

    public PolicyDocumentService(PolicyDocumentRepository policyDocumentRepository) {
        this.policyDocumentRepository = policyDocumentRepository;
    }

    public PolicyDocument uploadDocument(PolicyDocument document) {
        return policyDocumentRepository.save(document);
    }

    public List<PolicyDocument> getDocumentsByPolicyApplication(Long policyApplicationId) {
        return policyDocumentRepository.findByPolicyApplicationId(policyApplicationId);
    }
}
