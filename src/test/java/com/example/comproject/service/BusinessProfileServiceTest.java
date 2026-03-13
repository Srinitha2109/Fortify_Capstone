package com.example.comproject.service;

import com.example.comproject.dto.BusinessProfileDTO;
import com.example.comproject.entity.BusinessProfile;
import com.example.comproject.entity.User;
import com.example.comproject.repository.BusinessProfileRepository;
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
class BusinessProfileServiceTest {

    @Mock
    private BusinessProfileRepository profileRepository;

    @InjectMocks
    private BusinessProfileService profileService;

    @Test
    void testGetAllProfiles() {
        BusinessProfile profile = new BusinessProfile();
        profile.setId(1L);
        profile.setBusinessName("Test Biz");
        User user = new User();
        user.setId(10L);
        profile.setUser(user);

        when(profileRepository.findAll()).thenReturn(Arrays.asList(profile));

        List<BusinessProfileDTO> result = profileService.getAllProfiles();

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Test Biz", result.get(0).getBusinessName());
    }

    @Test
    void testGetProfileById() {
        BusinessProfile profile = new BusinessProfile();
        profile.setId(1L);
        profile.setBusinessName("Test Biz");
        User user = new User();
        user.setId(10L);
        profile.setUser(user);

        when(profileRepository.findById(1L)).thenReturn(Optional.of(profile));

        BusinessProfileDTO result = profileService.getProfileById(1L);

        assertNotNull(result);
        assertEquals("Test Biz", result.getBusinessName());
    }
}
