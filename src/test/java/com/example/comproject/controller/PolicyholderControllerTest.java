package com.example.comproject.controller;

import com.example.comproject.dto.PolicyApplicationDTO;
import com.example.comproject.dto.PolicyDTO;
import com.example.comproject.service.PolicyApplicationService;
import com.example.comproject.service.PolicyService;
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
class PolicyholderControllerTest {

    private MockMvc mockMvc;

    @Mock
    private PolicyService policyService;

    @Mock
    private PolicyApplicationService applicationService;

    @InjectMocks
    private PolicyholderController policyholderController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(policyholderController).build();
    }

    @Test
    void testGetPolicyDetails() throws Exception {
        PolicyDTO policy = new PolicyDTO();
        policy.setId(1L);
        policy.setPolicyName("Health Plus");

        when(policyService.getPolicyById(1L)).thenReturn(policy);

        mockMvc.perform(get("/api/policyholder/policies/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.policyName").value("Health Plus"));
    }

    @Test
    void testGetMyApplications() throws Exception {
        PolicyApplicationDTO app = new PolicyApplicationDTO();
        app.setId(1L);
        app.setPolicyNumber("APP-001");

        when(applicationService.getApplicationsByUserId(1L)).thenReturn(Arrays.asList(app));

        mockMvc.perform(get("/api/policyholder/my-applications/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].policyNumber").value("APP-001"));
    }
}
