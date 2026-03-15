package com.example.comproject.service;

import com.example.comproject.dto.UserDTO;
import com.example.comproject.entity.User;
import com.example.comproject.repository.AgentRepository;
import com.example.comproject.repository.BusinessProfileRepository;
import com.example.comproject.repository.ClaimOfficerRepository;
import com.example.comproject.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private BusinessProfileRepository businessProfileRepository;

    @Mock
    private AgentRepository agentRepository;

    @Mock
    private ClaimOfficerRepository claimOfficerRepository;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private UserService userService;

    /* ── getAllUsers ──────────────────────────────────────── */

    @Test
    void testGetAllUsers() {
        User user = new User();
        user.setId(1L);
        user.setFullName("Test User");

        when(userRepository.findAll()).thenReturn(Arrays.asList(user));

        List<UserDTO> result = userService.getAllUsers();

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Test User", result.get(0).getFullName());
    }

    @Test
    void testGetAllUsers_ReturnsEmptyListWhenNoUsers() {
        when(userRepository.findAll()).thenReturn(List.of());

        List<UserDTO> result = userService.getAllUsers();

        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    /* ── getUserById ─────────────────────────────────────── */

    @Test
    void testGetUserById() {
        User user = new User();
        user.setId(1L);
        user.setFullName("Test User");

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        UserDTO result = userService.getUserById(1L);

        assertNotNull(result);
        assertEquals("Test User", result.getFullName());
    }

    @Test
    void testGetUserById_ThrowsExceptionWhenNotFound() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> userService.getUserById(99L));
    }

    /* ── submitRegistrationRequest ───────────────────────── */

    @Test
    void testSubmitRegistrationRequest_Policyholder() {
        UserDTO dto = new UserDTO();
        dto.setEmail("biz@example.com");
        dto.setFullName("Business Owner");
        dto.setPhone("9999999999");
        dto.setRole(User.Role.POLICYHOLDER);
        dto.setBusinessName("BizCorp");
        dto.setIndustry("TECHNOLOGY");

        when(userRepository.findByEmail("biz@example.com")).thenReturn(Optional.empty());
        User saved = new User();
        saved.setId(10L);
        saved.setEmail("biz@example.com");
        saved.setFullName("Business Owner");
        saved.setRole(User.Role.POLICYHOLDER);
        saved.setStatus(User.Status.PENDING);
        when(userRepository.save(any(User.class))).thenReturn(saved);

        UserDTO result = userService.submitRegistrationRequest(dto);

        assertNotNull(result);
        assertEquals("Business Owner", result.getFullName());
        assertEquals(User.Status.PENDING, result.getStatus());
    }

    @Test
    void testSubmitRegistrationRequest_ThrowsWhenEmailAlreadyExists() {
        UserDTO dto = new UserDTO();
        dto.setEmail("existing@example.com");
        dto.setFullName("Duplicate User");
        dto.setRole(User.Role.POLICYHOLDER);

        when(userRepository.findByEmail("existing@example.com")).thenReturn(Optional.of(new User()));

        assertThrows(RuntimeException.class, () -> userService.submitRegistrationRequest(dto));
    }

    /* ── getPendingRegistrations ─────────────────────────── */

    @Test
    void testGetPendingRegistrations() {
        User pendingUser = new User();
        pendingUser.setId(1L);
        pendingUser.setFullName("Pending Person");
        pendingUser.setStatus(User.Status.PENDING);

        when(userRepository.findByStatus(User.Status.PENDING)).thenReturn(Arrays.asList(pendingUser));

        List<UserDTO> result = userService.getPendingRegistrations();

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(User.Status.PENDING, result.get(0).getStatus());
    }

    /* ── rejectRegistration ──────────────────────────────── */

    @Test
    void testRejectRegistration_Success() {
        User user = new User();
        user.setId(2L);
        user.setFullName("Rejected User");
        user.setEmail("reject@example.com");
        user.setStatus(User.Status.PENDING);

        when(userRepository.findById(2L)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenReturn(user);
        doNothing().when(emailService).sendRejectionEmail(anyString(), anyString(), anyString());

        UserDTO result = userService.rejectRegistration(2L, "Incomplete documents");

        assertEquals(User.Status.REJECTED, result.getStatus());
        verify(emailService).sendRejectionEmail("reject@example.com", "Rejected User", "Incomplete documents");
    }

    @Test
    void testRejectRegistration_ThrowsWhenUserNotFound() {
        when(userRepository.findById(999L)).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> userService.rejectRegistration(999L, "No reason"));
    }

    @Test
    void testRejectRegistration_ThrowsWhenNotPending() {
        User user = new User();
        user.setId(3L);
        user.setStatus(User.Status.ACTIVE); // Already processed

        when(userRepository.findById(3L)).thenReturn(Optional.of(user));

        assertThrows(RuntimeException.class, () -> userService.rejectRegistration(3L, "already processed"));
    }

    /* ── updateUser ──────────────────────────────────────── */

    @Test
    void testUpdateUser_Success() {
        User existingUser = new User();
        existingUser.setId(1L);
        existingUser.setFullName("Old Name");
        existingUser.setEmail("old@example.com");

        UserDTO dto = new UserDTO();
        dto.setFullName("New Name");
        dto.setEmail("new@example.com");
        dto.setPhone("8888888888");

        when(userRepository.findById(1L)).thenReturn(Optional.of(existingUser));
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        UserDTO result = userService.updateUser(1L, dto);

        assertEquals("New Name", result.getFullName());
        assertEquals("new@example.com", result.getEmail());
    }

    @Test
    void testUpdateUser_ThrowsWhenUserNotFound() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());
        UserDTO dto = new UserDTO();
        assertThrows(RuntimeException.class, () -> userService.updateUser(99L, dto));
    }

    /* ── deactivateUser & activateUser ───────────────────── */

    @Test
    void testDeactivateUser() {
        User user = new User();
        user.setId(1L);
        user.setStatus(User.Status.ACTIVE);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        UserDTO result = userService.deactivateUser(1L);

        assertEquals(User.Status.INACTIVE, result.getStatus());
    }

    @Test
    void testActivateUser() {
        User user = new User();
        user.setId(1L);
        user.setStatus(User.Status.INACTIVE);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        UserDTO result = userService.activateUser(1L);

        assertEquals(User.Status.ACTIVE, result.getStatus());
    }
}
