package com.example.comproject.controller;

import com.example.comproject.entity.ClaimDocument;
import com.example.comproject.repository.ClaimDocumentRepository;
import com.example.comproject.service.FileStorageService;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    private final ClaimDocumentRepository claimDocumentRepository;
    private final FileStorageService fileStorageService;

    public DocumentController(ClaimDocumentRepository claimDocumentRepository, FileStorageService fileStorageService) {
        this.claimDocumentRepository = claimDocumentRepository;
        this.fileStorageService = fileStorageService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Resource> getDocument(@PathVariable Long id) {
        ClaimDocument doc = claimDocumentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        Resource resource = fileStorageService.loadFileAsResource(doc.getFilePath());

        String contentType = doc.getFileType();
        if (contentType == null || contentType.isEmpty()) {
            contentType = "application/octet-stream";
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + doc.getFileName() + "\"")
                .body(resource);
    }
}
