package com.example.comproject.service;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.comproject.dto.ClaimDTO;
import com.example.comproject.entity.Claim;
import com.example.comproject.entity.PolicyApplication;
import com.example.comproject.repository.ClaimRepository;

@ExtendWith(MockitoExtension.class)
class ClaimServiceTest {

    @Mock
    private ClaimRepository claimRepository;

   
    @InjectMocks
    private ClaimService claimService;

    @Test
    void testGetClaimById() {
        Claim claim = new Claim();
        claim.setId(1L);
        claim.setClaimNumber("CLM-101");
        claim.setClaimAmount(new BigDecimal("2500.00"));
        
        PolicyApplication app = new PolicyApplication();
        app.setId(10L);
        app.setPolicyNumber("POL-001");
        claim.setPolicyApplication(app);

        when(claimRepository.findById(1L)).thenReturn(Optional.of(claim));

        ClaimDTO result = claimService.getClaimById(1L);
        
        assertNotNull(result);
        assertEquals("CLM-101", result.getClaimNumber());
        assertEquals(new BigDecimal("2500.00"), result.getClaimAmount());
    }

    @Test
    void testClaimNotFound() {
        when(claimRepository.findById(999L)).thenReturn(Optional.empty());
        
        ClaimDTO result = claimService.getClaimById(999L);
        assertNull(result);
    }
}
