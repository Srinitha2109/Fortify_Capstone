package com.example.comproject.controller;

import com.example.comproject.entity.ClaimDocument;
import com.example.comproject.repository.ClaimDocumentRepository;
import com.example.comproject.service.FileStorageService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Optional;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class DocumentControllerTest {

    private MockMvc mockMvc;

    @Mock
    private ClaimDocumentRepository claimDocumentRepository;

    @Mock
    private FileStorageService fileStorageService;

    @InjectMocks
    private DocumentController documentController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(documentController).build();
    }

    @Test
    void testGetDocument() throws Exception {
        ClaimDocument doc = new ClaimDocument();
        doc.setId(1L);
        doc.setFileName("test.pdf");
        doc.setFilePath("uploads/test.pdf");
        doc.setFileType("application/pdf");

        Resource resource = new ByteArrayResource("test content".getBytes());

        when(claimDocumentRepository.findById(1L)).thenReturn(Optional.of(doc));
        when(fileStorageService.loadFileAsResource("uploads/test.pdf")).thenReturn(resource);

        mockMvc.perform(get("/api/documents/1"))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"test.pdf\""))
                .andExpect(content().contentType(MediaType.APPLICATION_PDF));
    }
}
