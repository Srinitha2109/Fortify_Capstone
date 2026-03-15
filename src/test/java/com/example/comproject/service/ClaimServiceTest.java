package com.example.comproject.service;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.any;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.comproject.dto.ClaimDTO;
import com.example.comproject.entity.Claim;
import com.example.comproject.entity.Policy;
import com.example.comproject.entity.PolicyApplication;
import com.example.comproject.entity.User;
import com.example.comproject.repository.ClaimOfficerRepository;
import com.example.comproject.repository.ClaimRepository;
import com.example.comproject.repository.PolicyApplicationRepository;

@ExtendWith(MockitoExtension.class)
class ClaimServiceTest {

    @Mock
    private ClaimRepository claimRepository;

    @Mock
    private PolicyApplicationRepository policyApplicationRepository;

    @Mock
    private ClaimOfficerRepository claimOfficerRepository;

    @Mock
    private FileStorageService fileStorageService;

    @Mock
    private ClaimDocumentService claimDocumentService;

    @Mock
    private AppNotificationService notificationService;

    @InjectMocks
    private ClaimService claimService;

    private Claim buildClaim(Long id, String claimNumber) {
        Claim claim = new Claim();
        claim.setId(id);
        claim.setClaimNumber(claimNumber);
        claim.setClaimAmount(new BigDecimal("2500.00"));
        claim.setStatus(Claim.ClaimStatus.SUBMITTED);

        User user = new User();
        user.setId(1L);
        user.setFullName("Test Policyholder");

        Policy policy = new Policy();
        policy.setId(10L);
        policy.setPolicyName("Business Shield");

        PolicyApplication app = new PolicyApplication();
        app.setId(10L);
        app.setPolicyNumber("POL-001");
        app.setUser(user);
        app.setPlan(policy);

        claim.setPolicyApplication(app);
        return claim;
    }

    /* ── getClaimById ────────────────────────────────────── */

    @Test
    void testGetClaimById() {
        Claim claim = buildClaim(1L, "CLM-101");
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

    /* ── getClaimsByPolicyApplication ────────────────────── */

    @Test
    void testGetClaimsByPolicyApplication() {
        Claim claim = buildClaim(1L, "CLM-001");
        when(claimRepository.findByPolicyApplicationId(10L)).thenReturn(Arrays.asList(claim));

        List<ClaimDTO> result = claimService.getClaimsByPolicyApplication(10L);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("CLM-001", result.get(0).getClaimNumber());
    }

    @Test
    void testGetClaimsByPolicyApplication_ReturnsEmpty() {
        when(claimRepository.findByPolicyApplicationId(99L)).thenReturn(List.of());

        List<ClaimDTO> result = claimService.getClaimsByPolicyApplication(99L);

        assertNotNull(result);
        assertEquals(0, result.size());
    }

    /* ── getClaimsByUserId ───────────────────────────────── */

    @Test
    void testGetClaimsByUserId() {
        Claim claim = buildClaim(1L, "CLM-200");
        when(claimRepository.findAll()).thenReturn(Arrays.asList(claim));

        List<ClaimDTO> result = claimService.getClaimsByUserId(1L);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("CLM-200", result.get(0).getClaimNumber());
    }

    @Test
    void testGetClaimsByUserId_ReturnEmptyForDifferentUser() {
        Claim claim = buildClaim(1L, "CLM-200"); // belongs to userId 1
        when(claimRepository.findAll()).thenReturn(Arrays.asList(claim));

        // Request for userId 999 — no match
        List<ClaimDTO> result = claimService.getClaimsByUserId(999L);

        assertNotNull(result);
        assertEquals(0, result.size());
    }
}
