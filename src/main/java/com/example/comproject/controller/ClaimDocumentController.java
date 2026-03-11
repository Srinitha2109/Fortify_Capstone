package com.example.comproject.controller;

import com.example.comproject.entity.ClaimDocument;
import com.example.comproject.service.ClaimDocumentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/claim-documents")
public class ClaimDocumentController {
    private final ClaimDocumentService claimDocumentService;

    public ClaimDocumentController(ClaimDocumentService claimDocumentService) {
        this.claimDocumentService = claimDocumentService;
    }

    @PostMapping
    public ResponseEntity<ClaimDocument> uploadDocument(@RequestBody ClaimDocument document) {
        return ResponseEntity.ok(claimDocumentService.uploadDocument(document));
    }

    @GetMapping("/claim/{claimId}")
    public ResponseEntity<List<ClaimDocument>> getDocumentsByClaim(@PathVariable Long claimId) {
        return ResponseEntity.ok(claimDocumentService.getDocumentsByClaim(claimId));
    }
}
