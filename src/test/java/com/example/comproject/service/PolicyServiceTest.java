package com.example.comproject.service;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.any;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.comproject.dto.PolicyDTO;
import com.example.comproject.entity.InsuranceType;
import com.example.comproject.entity.Policy;
import com.example.comproject.repository.PolicyRepository;
import com.example.comproject.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class PolicyServiceTest {

    @Mock
    private PolicyRepository policyRepository;

    @Mock
    private AppNotificationService notificationService;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private PolicyService policyService;

    private Policy buildPolicy(Long id, String name, InsuranceType type, boolean active) {
        Policy policy = new Policy();
        policy.setId(id);
        policy.setPolicyName(name);
        policy.setInsuranceType(type);
        policy.setBasePremium(new BigDecimal("1200.00"));
        policy.setMinCoverageAmount(new BigDecimal("10000.00"));
        policy.setMaxCoverageAmount(new BigDecimal("100000.00"));
        policy.setDurationMonths(12);
        policy.setIsActive(active);
        policy.setPolicyNumber("POL-TEST-0001");
        policy.setDescription("Test policy description");
        return policy;
    }

    /* ── getPolicyById ───────────────────────────────────── */

    @Test
    void testGetPolicyById() {
        Policy policy = buildPolicy(1L, "Business Protection", InsuranceType.GENERAL_LIABILITY, true);
        when(policyRepository.findById(1L)).thenReturn(Optional.of(policy));

        PolicyDTO result = policyService.getPolicyById(1L);
        
        assertNotNull(result);
        assertEquals("Business Protection", result.getPolicyName());
        assertEquals("GENERAL_LIABILITY", result.getInsuranceType());
        assertEquals(new BigDecimal("1200.00"), result.getBasePremium());
    }

    @Test
    void testGetPolicyById_ReturnsNullWhenNotFound() {
        when(policyRepository.findById(99L)).thenReturn(Optional.empty());
        
        PolicyDTO result = policyService.getPolicyById(99L);
        assertNull(result);
    }

    /* ── getAllPolicies ───────────────────────────────────── */

    @Test
    void testGetAllPolicies() {
        Policy p1 = buildPolicy(1L, "Policy A", InsuranceType.GENERAL_LIABILITY, true);
        Policy p2 = buildPolicy(2L, "Policy B", InsuranceType.PROPERTY_DAMAGE, true);

        when(policyRepository.findAll()).thenReturn(Arrays.asList(p1, p2));

        List<PolicyDTO> result = policyService.getAllPolicies();

        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals("Policy A", result.get(0).getPolicyName());
        assertEquals("Policy B", result.get(1).getPolicyName());
    }

    @Test
    void testGetAllPolicies_ReturnsEmptyList() {
        when(policyRepository.findAll()).thenReturn(List.of());

        List<PolicyDTO> result = policyService.getAllPolicies();
        assertNotNull(result);
        assertEquals(0, result.size());
    }

    /* ── getActivePolicies ───────────────────────────────── */

    @Test
    void testGetActivePolicies() {
        Policy active = buildPolicy(1L, "Active Policy", InsuranceType.GENERAL_LIABILITY, true);

        when(policyRepository.findByIsActive(true)).thenReturn(Arrays.asList(active));

        List<PolicyDTO> result = policyService.getActivePolicies();

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(Boolean.TRUE, result.get(0).getIsActive());
    }

    /* ── getPoliciesByInsuranceType ──────────────────────── */

    @Test
    void testGetPoliciesByInsuranceType() {
        Policy policy = buildPolicy(1L, "Liability Plan", InsuranceType.GENERAL_LIABILITY, true);

        when(policyRepository.findByInsuranceType(InsuranceType.GENERAL_LIABILITY))
                .thenReturn(Arrays.asList(policy));

        List<PolicyDTO> result = policyService.getPoliciesByInsuranceType("GENERAL_LIABILITY");

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("GENERAL_LIABILITY", result.get(0).getInsuranceType());
    }

    @Test
    void testGetPoliciesByInsuranceType_ThrowsOnInvalidType() {
        assertThrows(IllegalArgumentException.class,
                () -> policyService.getPoliciesByInsuranceType("INVALID_TYPE"));
    }

    /* ── updatePolicy ────────────────────────────────────── */

    @Test
    void testUpdatePolicy_Success() {
        Policy existing = buildPolicy(1L, "Old Name", InsuranceType.GENERAL_LIABILITY, true);
        when(policyRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(policyRepository.save(any(Policy.class))).thenAnswer(inv -> inv.getArgument(0));

        PolicyDTO dto = new PolicyDTO();
        dto.setPolicyName("Updated Name");
        dto.setInsuranceType("GENERAL_LIABILITY");
        dto.setBasePremium(new BigDecimal("1500.00"));
        dto.setMinCoverageAmount(new BigDecimal("10000.00"));
        dto.setMaxCoverageAmount(new BigDecimal("200000.00"));
        dto.setDurationMonths(24);
        dto.setIsActive(true);
        dto.setDescription("Updated description");

        PolicyDTO result = policyService.updatePolicy(1L, dto);

        assertEquals("Updated Name", result.getPolicyName());
        assertEquals(new BigDecimal("1500.00"), result.getBasePremium());
    }

    @Test
    void testUpdatePolicy_ThrowsWhenNotFound() {
        when(policyRepository.findById(99L)).thenReturn(Optional.empty());

        PolicyDTO dto = new PolicyDTO();
        dto.setInsuranceType("GENERAL_LIABILITY");
        dto.setMinCoverageAmount(new BigDecimal("1000.00"));
        dto.setMaxCoverageAmount(new BigDecimal("50000.00"));

        assertThrows(RuntimeException.class, () -> policyService.updatePolicy(99L, dto));
    }
}
