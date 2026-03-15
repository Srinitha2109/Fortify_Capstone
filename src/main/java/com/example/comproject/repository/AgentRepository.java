package com.example.comproject.repository;

import com.example.comproject.entity.Agent;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface AgentRepository extends JpaRepository<Agent, Long> {
    Optional<Agent> findByAgentCode(String agentCode);
    Optional<Agent> findByUserId(Long userId);
    Optional<Agent> findByLicenseNumber(String licenseNumber);
    boolean existsByUserId(long id);

    List<Agent> findBySpecialization(Agent.Specialization specialization);

    // Agents matching specialization AND not yet assigned to any BusinessProfile
    List<Agent> findBySpecializationAndBusinessProfilesIsEmpty(Agent.Specialization specialization);

    // All agents not yet assigned to any BusinessProfile
    List<Agent> findByBusinessProfilesIsEmpty();
}
