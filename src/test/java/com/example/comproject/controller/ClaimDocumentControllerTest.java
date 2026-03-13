package com.example.comproject.controller;

import com.example.comproject.entity.ClaimDocument;
import com.example.comproject.service.ClaimDocumentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Arrays;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class ClaimDocumentControllerTest {

    private MockMvc mockMvc;

    @Mock
    private ClaimDocumentService documentService;

    @InjectMocks
    private ClaimDocumentController documentController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(documentController).build();
    }

    @Test
    void testGetDocumentsByClaimId() throws Exception {
        ClaimDocument doc = new ClaimDocument();
        doc.setId(1L);
        doc.setFileName("test.pdf");

        when(documentService.getDocumentsByClaim(1L)).thenReturn(Arrays.asList(doc));

        mockMvc.perform(get("/api/claim-documents/claim/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].fileName").value("test.pdf"));
    }
}
