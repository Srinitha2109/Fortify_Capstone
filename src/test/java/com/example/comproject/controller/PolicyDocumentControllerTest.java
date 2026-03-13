package com.example.comproject.controller;

import com.example.comproject.entity.PolicyDocument;
import com.example.comproject.service.PolicyDocumentService;
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
class PolicyDocumentControllerTest {

    private MockMvc mockMvc;

    @Mock
    private PolicyDocumentService documentService;

    @InjectMocks
    private PolicyDocumentController documentController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(documentController).build();
    }

    @Test
    void testGetDocumentsByPolicyApplication() throws Exception {
        PolicyDocument doc = new PolicyDocument();
        doc.setId(1L);
        doc.setFileName("policy.pdf");

        when(documentService.getDocumentsByPolicyApplication(1L)).thenReturn(Arrays.asList(doc));

        mockMvc.perform(get("/api/policy-documents/policy-application/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].fileName").value("policy.pdf"));
    }
}
