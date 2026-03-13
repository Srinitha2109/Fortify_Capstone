package com.example.comproject.service;

import com.example.comproject.dto.AgentDTO;
import com.example.comproject.entity.Agent;
import com.example.comproject.entity.User;
import com.example.comproject.repository.AgentRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AgentServiceTest {

    @Mock
    private AgentRepository agentRepository;

    @InjectMocks
    private AgentService agentService;

    @Test
    void testGetAllAgents() {
        Agent agent = new Agent();
        agent.setId(1L);
        User user = new User();
        user.setFullName("John Doe");
        agent.setUser(user);

        when(agentRepository.findAll()).thenReturn(Arrays.asList(agent));

        List<AgentDTO> result = agentService.getAllAgents();

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("John Doe", result.get(0).getFullName());
    }

    @Test
    void testGetAgentById() {
        Agent agent = new Agent();
        agent.setId(1L);
        User user = new User();
        user.setFullName("John Doe");
        agent.setUser(user);

        when(agentRepository.findById(1L)).thenReturn(Optional.of(agent));

        AgentDTO result = agentService.getAgentById(1L);

        assertNotNull(result);
        assertEquals("John Doe", result.getFullName());
    }
}
