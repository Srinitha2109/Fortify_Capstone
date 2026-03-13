package com.example.comproject.service;

import com.example.comproject.entity.ClaimOfficer;
import com.example.comproject.repository.ClaimOfficerRepository;
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
class ClaimOfficerServiceTest {

    @Mock
    private ClaimOfficerRepository officerRepository;

    @InjectMocks
    private ClaimOfficerService officerService;

    @Test
    void testGetAllClaimOfficers() {
        ClaimOfficer officer = new ClaimOfficer();
        officer.setId(1L);
        officer.setEmployeeCode("EMP-001");

        when(officerRepository.findAll()).thenReturn(Arrays.asList(officer));

        List<ClaimOfficer> result = officerService.getAllClaimOfficers();

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("EMP-001", result.get(0).getEmployeeCode());
    }

    @Test
    void testGetClaimOfficerById() {
        ClaimOfficer officer = new ClaimOfficer();
        officer.setId(1L);
        officer.setEmployeeCode("EMP-001");

        when(officerRepository.findById(1L)).thenReturn(Optional.of(officer));

        ClaimOfficer result = officerService.getClaimOfficerById(1L);

        assertNotNull(result);
        assertEquals("EMP-001", result.getEmployeeCode());
    }
}
