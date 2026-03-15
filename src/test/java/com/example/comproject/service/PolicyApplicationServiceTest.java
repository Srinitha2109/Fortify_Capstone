package com.example.comproject.service;

import com.example.comproject.dto.PolicyApplicationDTO;
import com.example.comproject.entity.PolicyApplication;
import com.example.comproject.entity.User;
import com.example.comproject.entity.Policy;
import com.example.comproject.entity.BusinessProfile;
import com.example.comproject.repository.PolicyApplicationRepository;
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
class PolicyApplicationServiceTest {

    @Mock
    private com.example.comproject.repository.PolicyApplicationRepository applicationRepository;

    @Mock
    private com.example.comproject.repository.UserRepository userRepository;

    @Mock
    private com.example.comproject.repository.PolicyRepository policyRepository;

    @Mock
    private com.example.comproject.repository.BusinessProfileRepository businessProfileRepository;

    @Mock
    private com.example.comproject.repository.AgentRepository agentRepository;

    @Mock
    private com.example.comproject.repository.ClaimOfficerRepository claimOfficerRepository;

    @Mock
    private com.example.comproject.repository.ClaimRepository claimRepository;

    @Mock
    private AppNotificationService notificationService;

    @InjectMocks
    private PolicyApplicationService applicationService;

    @Test
    void testGetAllApplications() {
        PolicyApplication app = new PolicyApplication();
        app.setId(1L);
        app.setPolicyNumber("APP-0001");
        
        User user = new User();
        user.setId(10L);
        app.setUser(user);
        
        Policy policy = new Policy();
        policy.setId(20L);
        app.setPlan(policy);

        when(applicationRepository.findAll()).thenReturn(Arrays.asList(app));

        List<PolicyApplicationDTO> result = applicationService.getAllApplications();

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("APP-0001", result.get(0).getPolicyNumber());
    }

    @Test
    void testGetApplicationById() {
        PolicyApplication app = new PolicyApplication();
        app.setId(1L);
        app.setPolicyNumber("APP-0001");
        
        User user = new User();
        user.setId(10L);
        app.setUser(user);
        
        Policy policy = new Policy();
        policy.setId(20L);
        app.setPlan(policy);

        when(applicationRepository.findById(1L)).thenReturn(Optional.of(app));

        PolicyApplicationDTO result = applicationService.getApplicationById(1L);

        assertNotNull(result);
        assertEquals("APP-0001", result.getPolicyNumber());
    }
}
