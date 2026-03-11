package com.example.comproject.controller;

import com.example.comproject.dto.PolicyDTO;
import com.example.comproject.service.PolicyService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.util.Arrays;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class PolicyControllerTest {

    private MockMvc mockMvc;

    @Mock
    private PolicyService policyService;

    @InjectMocks
    private PolicyController policyController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(policyController).build();
    }

    @Test
    void testGetPolicyById() throws Exception {
        PolicyDTO policy = new PolicyDTO();
        policy.setId(1L);
        policy.setPolicyName("Fire Insurance");
        policy.setBasePremium(new BigDecimal("500.00"));

        when(policyService.getPolicyById(1L)).thenReturn(policy);

        mockMvc.perform(get("/api/policies/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.policyName").value("Fire Insurance"))
                .andExpect(jsonPath("$.basePremium").value(500.00));
    }

    @Test
    void testGetAllPolicies() throws Exception {
        PolicyDTO p1 = new PolicyDTO();
        p1.setPolicyName("Policy 1");
        PolicyDTO p2 = new PolicyDTO();
        p2.setPolicyName("Policy 2");

        when(policyService.getAllPolicies()).thenReturn(Arrays.asList(p1, p2));

        mockMvc.perform(get("/api/policies"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].policyName").value("Policy 1"));
    }
}
