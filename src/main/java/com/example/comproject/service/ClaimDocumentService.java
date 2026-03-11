package com.example.comproject.service;

import com.example.comproject.entity.ClaimDocument;
import com.example.comproject.repository.ClaimDocumentRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ClaimDocumentService {
    private final ClaimDocumentRepository claimDocumentRepository;

    public ClaimDocumentService(ClaimDocumentRepository claimDocumentRepository) {
        this.claimDocumentRepository = claimDocumentRepository;
    }

    public ClaimDocument uploadDocument(ClaimDocument document) {
        return claimDocumentRepository.save(document);
    }

    public List<ClaimDocument> getDocumentsByClaim(Long claimId) {
        return claimDocumentRepository.findByClaimId(claimId);
    }
}
