package com.example.comproject.controller;

import com.example.comproject.entity.PolicyDocument;
import com.example.comproject.service.PolicyDocumentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/policy-documents")
public class PolicyDocumentController {
    private final PolicyDocumentService policyDocumentService;

    public PolicyDocumentController(PolicyDocumentService policyDocumentService) {
        this.policyDocumentService = policyDocumentService;
    }

    @PostMapping
    public ResponseEntity<PolicyDocument> uploadDocument(@RequestBody PolicyDocument document) {
        return ResponseEntity.ok(policyDocumentService.uploadDocument(document));
    }

    @GetMapping("/policy-application/{policyApplicationId}")
    public ResponseEntity<List<PolicyDocument>> getDocumentsByPolicyApplication(@PathVariable Long policyApplicationId) {
        return ResponseEntity.ok(policyDocumentService.getDocumentsByPolicyApplication(policyApplicationId));
    }
}
