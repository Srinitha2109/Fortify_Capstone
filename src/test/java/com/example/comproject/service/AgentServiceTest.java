package com.example.comproject.service;

import com.example.comproject.dto.AgentDTO;
import com.example.comproject.entity.Agent;
import com.example.comproject.entity.User;
import com.example.comproject.repository.AgentRepository;
import com.example.comproject.repository.UserRepository;
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

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private AgentService agentService;

    private Agent buildAgent(Long id, String name) {
        Agent agent = new Agent();
        agent.setId(id);
        User user = new User();
        user.setId(id * 10);
        user.setFullName(name);
        agent.setUser(user);
        agent.setAgentCode("AGT-" + String.format("%04d", id));
        agent.setLicenseNumber("LIC-" + id);
        return agent;
    }

    /* ── getAllAgents ─────────────────────────────────────── */

    @Test
    void testGetAllAgents() {
        Agent agent = buildAgent(1L, "John Doe");

        when(agentRepository.findAll()).thenReturn(Arrays.asList(agent));

        List<AgentDTO> result = agentService.getAllAgents();

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("John Doe", result.get(0).getFullName());
    }

    @Test
    void testGetAllAgents_ReturnsEmptyList() {
        when(agentRepository.findAll()).thenReturn(List.of());

        List<AgentDTO> result = agentService.getAllAgents();

        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    @Test
    void testGetAllAgents_ReturnsMultipleAgents() {
        Agent a1 = buildAgent(1L, "John Doe");
        Agent a2 = buildAgent(2L, "Jane Smith");

        when(agentRepository.findAll()).thenReturn(Arrays.asList(a1, a2));

        List<AgentDTO> result = agentService.getAllAgents();

        assertEquals(2, result.size());
        assertEquals("John Doe", result.get(0).getFullName());
        assertEquals("Jane Smith", result.get(1).getFullName());
    }

    /* ── getAgentById ────────────────────────────────────── */

    @Test
    void testGetAgentById() {
        Agent agent = buildAgent(1L, "John Doe");

        when(agentRepository.findById(1L)).thenReturn(Optional.of(agent));

        AgentDTO result = agentService.getAgentById(1L);

        assertNotNull(result);
        assertEquals("John Doe", result.getFullName());
        assertEquals("AGT-0001", result.getAgentCode());
    }

    @Test
    void testGetAgentById_ReturnsNullWhenNotFound() {
        when(agentRepository.findById(99L)).thenReturn(Optional.empty());

        AgentDTO result = agentService.getAgentById(99L);

        assertNull(result);
    }

    /* ── getAgentByUserId ────────────────────────────────── */

    @Test
    void testGetAgentByUserId() {
        Agent agent = buildAgent(1L, "Jane Smith");

        when(agentRepository.findByUserId(10L)).thenReturn(Optional.of(agent));

        AgentDTO result = agentService.getAgentByUserId(10L);

        assertNotNull(result);
        assertEquals("Jane Smith", result.getFullName());
    }

    @Test
    void testGetAgentByUserId_ReturnsNullWhenNotFound() {
        when(agentRepository.findByUserId(999L)).thenReturn(Optional.empty());

        AgentDTO result = agentService.getAgentByUserId(999L);

        assertNull(result);
    }

    /* ── getAgentsBySpecialization ───────────────────────── */

    @Test
    void testGetAgentsBySpecialization_InvalidSpecReturnsEmptyList() {
        List<AgentDTO> result = agentService.getAgentsBySpecialization("UNKNOWN_SPEC");
        assertNotNull(result);
        assertTrue(result.isEmpty());
    }
}
