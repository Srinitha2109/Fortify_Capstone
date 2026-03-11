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

import com.example.comproject.dto.PolicyDTO;
import com.example.comproject.entity.InsuranceType;
import com.example.comproject.entity.Policy;
import com.example.comproject.repository.PolicyRepository;

@ExtendWith(MockitoExtension.class)
class PolicyServiceTest {

    @Mock
    private PolicyRepository policyRepository;


    @InjectMocks
    private PolicyService policyService;

    @Test
    void testGetPolicyById() {
        Policy policy = new Policy();
        policy.setId(1L);
        policy.setPolicyName("Business Protection");
        policy.setInsuranceType(InsuranceType.GENERAL_LIABILITY);
        policy.setBasePremium(new BigDecimal("1200.00"));
        policy.setMinCoverageAmount(new BigDecimal("1000.00"));
        policy.setMaxCoverageAmount(new BigDecimal("5000.00"));

        when(policyRepository.findById(1L)).thenReturn(Optional.of(policy));

        PolicyDTO result = policyService.getPolicyById(1L);
        
        assertNotNull(result);
        assertEquals("Business Protection", result.getPolicyName());
        assertEquals("GENERAL_LIABILITY", result.getInsuranceType());
    }

    @Test
    void testPolicyNotFound() {
        when(policyRepository.findById(99L)).thenReturn(Optional.empty());
        
        PolicyDTO result = policyService.getPolicyById(99L);
        assertNull(result);
    }
}
