// package com.example.comproject.controller;

// import com.example.comproject.dto.BusinessProfileDTO;
// import com.example.comproject.service.BusinessProfileService;
// import org.junit.jupiter.api.BeforeEach;
// import org.junit.jupiter.api.Test;
// import org.junit.jupiter.api.extension.ExtendWith;
// import org.mockito.InjectMocks;
// import org.mockito.Mock;
// import org.mockito.junit.jupiter.MockitoExtension;
// import org.springframework.test.web.servlet.MockMvc;
// import org.springframework.test.web.servlet.setup.MockMvcBuilders;

// import java.util.Arrays;

// import static org.mockito.Mockito.when;
// import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
// import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
// import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

// @ExtendWith(MockitoExtension.class)
// class BusinessProfileControllerTest {

//     private MockMvc mockMvc;

//     @Mock
//     private BusinessProfileService profileService;

//     @InjectMocks
//     private BusinessProfileController profileController;

//     @BeforeEach
//     void setUp() {
//         mockMvc = MockMvcBuilders.standaloneSetup(profileController).build();
//     }

//     @Test
//     void testGetAllProfiles() throws Exception {
//         BusinessProfileDTO profile = new BusinessProfileDTO();
//         profile.setId(1L);
//         profile.setBusinessName("Test Biz");

//         when(profileService.getAllProfiles()).thenReturn(Arrays.asList(profile));

//         mockMvc.perform(get("/api/business-profiles"))
//                 .andExpect(status().isOk())
//                 .andExpect(jsonPath("$.length()").value(1))
//                 .andExpect(jsonPath("$[0].businessName").value("Test Biz"));
//     }

//     @Test
//     void testGetProfileById() throws Exception {
//         BusinessProfileDTO profile = new BusinessProfileDTO();
//         profile.setId(1L);
//         profile.setBusinessName("Test Biz");

//         when(profileService.getProfileById(1L)).thenReturn(profile);

//         mockMvc.perform(get("/api/business-profiles/1"))
//                 .andExpect(status().isOk())
//                 .andExpect(jsonPath("$.businessName").value("Test Biz"));
//     }
// }
