package com.example.comproject.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.comproject.dto.AgentDTO;
import com.example.comproject.entity.Agent;
import com.example.comproject.exception.DuplicateResourceException;
import com.example.comproject.exception.ResourceNotFoundException;
import com.example.comproject.repository.AgentRepository;
import com.example.comproject.repository.UserRepository;

@Service
public class AgentService {
    private final AgentRepository agentRepository;
    private final UserRepository userRepository;

    public AgentService(AgentRepository agentRepository, UserRepository userRepository) {
        this.agentRepository = agentRepository;
        this.userRepository = userRepository;
    }

    public AgentDTO createAgent(AgentDTO dto) {
        if (agentRepository.findByLicenseNumber(dto.getLicenseNumber()).isPresent()) {
            throw new DuplicateResourceException("Agent with license number " + dto.getLicenseNumber() + " already exists");
        }
        Agent agent = new Agent();
        agent.setUser(userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found")));
        agent.setAgentCode(generateAgentCode(dto.getSpecialization()));
        agent.setLicenseNumber(dto.getLicenseNumber());
        agent.setTerritory(dto.getTerritory());
        agent.setSpecialization(dto.getSpecialization());
        agent.setCommissionRate(dto.getCommissionRate());
        return toDTO(agentRepository.save(agent));
    }

    private String generateAgentCode(Agent.Specialization specialization) {
        String prefix = specialization != null ? specialization.name().substring(0, Math.min(3, specialization.name().length())) : "AGT";
        long count = agentRepository.count() + 1;
        return String.format("%s-%04d", prefix, count);
    }

    public AgentDTO getAgentById(Long id) {
        return agentRepository.findById(id).map(this::toDTO).orElse(null);
    }

    public AgentDTO getAgentByUserId(Long userId) {
        return agentRepository.findByUserId(userId).map(this::toDTO).orElse(null);
    }

    public List<AgentDTO> getAllAgents() {
        return agentRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<AgentDTO> getAvailableAgentsBySpecialization(String specializationStr) {
        try {
            Agent.Specialization spec = Agent.Specialization.valueOf(specializationStr.toUpperCase());
            return agentRepository.findBySpecializationAndBusinessProfilesIsEmpty(spec).stream()
                    .map(this::toDTO).collect(Collectors.toList());
        } catch (IllegalArgumentException e) {
            // If specialization doesn't match enum (e.g. 'OTHER'), return all unassigned agents
            return agentRepository.findByBusinessProfilesIsEmpty().stream()
                    .map(this::toDTO).collect(Collectors.toList());
        }
    }

    public List<AgentDTO> getAvailableAgents() {
        return agentRepository.findByBusinessProfilesIsEmpty().stream()
                .map(this::toDTO).collect(Collectors.toList());
    }

    public List<AgentDTO> getAgentsBySpecialization(String specializationStr) {
        try {
            Agent.Specialization spec = Agent.Specialization.valueOf(specializationStr.toUpperCase());
            return agentRepository.findBySpecialization(spec).stream()
                    .map(this::toDTO).collect(Collectors.toList());
        } catch (IllegalArgumentException e) {
            return List.of();
        }
    }

    private AgentDTO toDTO(Agent agent) {
        AgentDTO dto = new AgentDTO();
        dto.setId(agent.getId());
        dto.setFullName(agent.getUser().getFullName());
        dto.setUserId(agent.getUser().getId());
        dto.setAgentCode(agent.getAgentCode());
        dto.setLicenseNumber(agent.getLicenseNumber());
        dto.setTerritory(agent.getTerritory());
        dto.setSpecialization(agent.getSpecialization());
        dto.setCommissionRate(agent.getCommissionRate());
        return dto;
    }
}
