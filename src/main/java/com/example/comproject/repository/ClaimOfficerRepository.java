package com.example.comproject.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.comproject.entity.ClaimOfficer;

public interface ClaimOfficerRepository extends JpaRepository<ClaimOfficer, Long> {
    Optional<ClaimOfficer> findByUserId(Long userId);

    List<ClaimOfficer> findBySpecialization(ClaimOfficer.Specialization specialization);

    boolean existsByUserId(long id);

    // ClaimOfficers matching specialization AND not yet assigned to any BusinessProfile
    List<ClaimOfficer> findBySpecializationAndBusinessProfilesIsEmpty(ClaimOfficer.Specialization specialization);

    // All ClaimOfficers not yet assigned to any BusinessProfile
    List<ClaimOfficer> findByBusinessProfilesIsEmpty();
}
