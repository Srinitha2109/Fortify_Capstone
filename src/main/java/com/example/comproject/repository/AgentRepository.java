package com.example.comproject.repository;

import com.example.comproject.entity.Agent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface AgentRepository extends JpaRepository<Agent, Long> {
    Optional<Agent> findByAgentCode(String agentCode);
    Optional<Agent> findByUserId(Long userId);
    Optional<Agent> findByLicenseNumber(String licenseNumber);
    boolean existsByUserId(long id);

    List<Agent> findBySpecialization(Agent.Specialization specialization);

    /** Agents matching specialization AND not yet assigned to any BusinessProfile */
    @Query("SELECT a FROM Agent a WHERE a.specialization = :spec " +
           "AND a.id NOT IN (SELECT bp.agent.id FROM BusinessProfile bp WHERE bp.agent IS NOT NULL)")
    List<Agent> findAvailableBySpecialization(@Param("spec") Agent.Specialization spec);
}
