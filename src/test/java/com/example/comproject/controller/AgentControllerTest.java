package com.example.comproject.controller;

import com.example.comproject.dto.AgentDTO;
import com.example.comproject.service.AgentService;
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
class AgentControllerTest {

    private MockMvc mockMvc;

    @Mock
    private AgentService agentService;

    @Mock
    private PolicyApplicationService policyApplicationService;

    @InjectMocks
    private AgentController agentController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(agentController).build();
    }

    @Test
    void testGetAllAgents() throws Exception {
        AgentDTO agent = new AgentDTO();
        agent.setId(1L);
        agent.setFullName("Agent Smith");

        when(agentService.getAllAgents()).thenReturn(Arrays.asList(agent));

        mockMvc.perform(get("/api/agents"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].fullName").value("Agent Smith"));
    }

    @Test
    void testGetAgentById() throws Exception {
        AgentDTO agent = new AgentDTO();
        agent.setId(1L);
        agent.setFullName("Agent Smith");

        when(agentService.getAgentById(1L)).thenReturn(agent);

        mockMvc.perform(get("/api/agents/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fullName").value("Agent Smith"));
    }
}
