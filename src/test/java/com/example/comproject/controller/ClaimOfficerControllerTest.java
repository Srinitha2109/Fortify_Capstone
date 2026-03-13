package com.example.comproject.controller;

import com.example.comproject.entity.ClaimOfficer;
import com.example.comproject.service.ClaimOfficerService;
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
class ClaimOfficerControllerTest {

    private MockMvc mockMvc;

    @Mock
    private ClaimOfficerService officerService;

    @InjectMocks
    private ClaimOfficerController officerController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(officerController).build();
    }

    @Test
    void testGetAllClaimOfficers() throws Exception {
        ClaimOfficer officer = new ClaimOfficer();
        officer.setId(1L);
        officer.setEmployeeCode("EMP-001");

        when(officerService.getAllClaimOfficers()).thenReturn(Arrays.asList(officer));

        mockMvc.perform(get("/api/claim-officers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].employeeCode").value("EMP-001"));
    }

    @Test
    void testGetClaimOfficerById() throws Exception {
        ClaimOfficer officer = new ClaimOfficer();
        officer.setId(1L);
        officer.setEmployeeCode("EMP-001");

        when(officerService.getClaimOfficerById(1L)).thenReturn(officer);

        mockMvc.perform(get("/api/claim-officers/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.employeeCode").value("EMP-001"));
    }
}
