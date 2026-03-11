package com.example.comproject.repository;

import com.example.comproject.entity.ClaimDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ClaimDocumentRepository extends JpaRepository<ClaimDocument, Long> {
    List<ClaimDocument> findByClaimId(Long claimId);
}
