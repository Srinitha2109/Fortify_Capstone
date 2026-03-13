package com.example.comproject.service;

import com.example.comproject.entity.PolicyDocument;
import com.example.comproject.repository.PolicyDocumentRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PolicyDocumentServiceTest {

    @Mock
    private PolicyDocumentRepository documentRepository;

    @InjectMocks
    private PolicyDocumentService documentService;

    @Test
    void testGetDocumentsByPolicyApplication() {
        PolicyDocument doc = new PolicyDocument();
        doc.setId(1L);
        doc.setFileName("policy.pdf");

        when(documentRepository.findByPolicyApplicationId(1L)).thenReturn(Arrays.asList(doc));

        List<PolicyDocument> result = documentService.getDocumentsByPolicyApplication(1L);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("policy.pdf", result.get(0).getFileName());
    }
}
