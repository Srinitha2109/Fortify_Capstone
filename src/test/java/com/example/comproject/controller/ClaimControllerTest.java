package com.example.comproject.controller;

import java.math.BigDecimal;
import java.util.Arrays;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.example.comproject.dto.ClaimDTO;
import com.example.comproject.service.ClaimService;

@ExtendWith(MockitoExtension.class) //to ensure mockito annotations work 
class ClaimControllerTest {

    //mock mvc is used to send the http requests
    ///verify is used to test whether the methods are called or not verify whether fake service is being called or not
    private MockMvc mockMvc;

    @Mock
    private ClaimService claimService;

    @InjectMocks
    private ClaimController claimController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(claimController).build();
    }

    @Test
    void testGetClaimById() throws Exception {
        ClaimDTO claim = new ClaimDTO();
        claim.setClaimNumber("CLM-0001");
        claim.setClaimAmount(new BigDecimal("1000.00"));

        when(claimService.getClaimById(1L)).thenReturn(claim);

        mockMvc.perform(get("/api/claims/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.claimNumber").value("CLM-0001"))
                .andExpect(jsonPath("$.claimAmount").value(1000.00));
    }

    @Test
    void testGetClaimsByUserId() throws Exception {
        ClaimDTO c1 = new ClaimDTO();
        c1.setClaimNumber("CLM-0001");
        
        when(claimService.getClaimsByUserId(1L)).thenReturn(Arrays.asList(c1));

        mockMvc.perform(get("/api/claims/user/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].claimNumber").value("CLM-0001"));
    }
}
