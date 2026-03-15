package com.example.comproject.controller;

import com.example.comproject.dto.PolicyApplicationDTO;
import com.example.comproject.service.PolicyApplicationService;
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
class PolicyApplicationControllerTest {

    private MockMvc mockMvc;

    @Mock
    private PolicyApplicationService applicationService;

    @InjectMocks
    private PolicyApplicationController applicationController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(applicationController).build();
    }

    @Test
    void testGetAllApplications() throws Exception {
        PolicyApplicationDTO app = new PolicyApplicationDTO();
        app.setId(1L);
        app.setPolicyNumber("APP-0001");

        when(applicationService.getAllApplications()).thenReturn(Arrays.asList(app));

        mockMvc.perform(get("/api/policy-applications/all"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].policyNumber").value("APP-0001"));
    }

    @Test
    void testGetApplicationById() throws Exception {
        PolicyApplicationDTO app = new PolicyApplicationDTO();
        app.setId(1L);
        app.setPolicyNumber("APP-0001");

        when(applicationService.getApplicationById(1L)).thenReturn(app);

        mockMvc.perform(get("/api/policy-applications/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.policyNumber").value("APP-0001"));
    }
}
