package com.example.comproject.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.comproject.dto.AgentDTO;
import com.example.comproject.dto.PolicyApplicationDTO;
import com.example.comproject.service.AgentService;
import com.example.comproject.service.PolicyApplicationService;

@RestController
@RequestMapping("/api/agents")
public class AgentController {
    private final PolicyApplicationService policyApplicationService;
    private final AgentService agentService;

    public AgentController(PolicyApplicationService policyApplicationService, AgentService agentService) {
        this.policyApplicationService = policyApplicationService;
        this.agentService = agentService;
    }

    @PreAuthorize("hasRole('ADMIN')") //reads the role from security context in jwtAuthFilter
    @PostMapping
    public ResponseEntity<?> createAgent(@RequestBody AgentDTO agent) {
        try {
            return ResponseEntity.ok(agentService.createAgent(agent));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    @GetMapping("/{id}")
    public ResponseEntity<AgentDTO> getAgentById(@PathVariable Long id) {
        AgentDTO agent = agentService.getAgentById(id);
        return agent != null ? ResponseEntity.ok(agent) : ResponseEntity.notFound().build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<List<AgentDTO>> getAllAgents() {
        return ResponseEntity.ok(agentService.getAllAgents());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/available")
    public ResponseEntity<List<AgentDTO>> getAvailableAgentsBySpecialization(
            @RequestParam(required = false) String specialization) {
        if (specialization != null && !specialization.isBlank()) {
            return ResponseEntity.ok(agentService.getAvailableAgentsBySpecialization(specialization));
        }
        return ResponseEntity.ok(agentService.getAvailableAgents());
    }

    @PreAuthorize("hasRole('AGENT')")
    @GetMapping("/applications")
    public ResponseEntity<List<PolicyApplicationDTO>> getMyApplications(@RequestParam Long agentId) {
        return ResponseEntity.ok(policyApplicationService.getApplicationsByAgentId(agentId));
    }

    
}
