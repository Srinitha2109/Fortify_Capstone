package com.example.comproject.service;

import com.example.comproject.dto.NotificationDTO;
import com.example.comproject.entity.Notification;
import com.example.comproject.entity.User;
import com.example.comproject.repository.NotificationRepository;
import com.example.comproject.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AppNotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private AppNotificationService notificationService;

    @Test
    void testNotify() {
        User recipient = new User();
        recipient.setId(1L);

        notificationService.notify(recipient, "Hello", "TYPE");

        verify(notificationRepository, times(1)).save(any(Notification.class));
    }

    @Test
    void testGetNotificationsForUser() {
        Notification n = new Notification();
        n.setId(1L);
        n.setMessage("Test");
        n.setRead(false);

        when(notificationRepository.findByRecipientIdOrderByCreatedAtDesc(1L)).thenReturn(Arrays.asList(n));

        List<NotificationDTO> result = notificationService.getNotificationsForUser(1L);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Test", result.get(0).getMessage());
    }

    @Test
    void testGetUnreadCount() {
        when(notificationRepository.countByRecipientIdAndIsReadFalse(1L)).thenReturn(3L);

        long count = notificationService.getUnreadCount(1L);

        assertEquals(3L, count);
    }

    @Test
    void testMarkAsRead() {
        Notification n = new Notification();
        n.setId(1L);
        n.setRead(false);

        when(notificationRepository.findById(1L)).thenReturn(Optional.of(n));

        notificationService.markAsRead(1L);

        assertTrue(n.isRead());
        verify(notificationRepository).save(n);
    }

    @Test
    void testMarkAllAsRead() {
        Notification n1 = new Notification();
        n1.setRead(false);
        Notification n2 = new Notification();
        n2.setRead(true);

        when(notificationRepository.findByRecipientIdOrderByCreatedAtDesc(1L)).thenReturn(Arrays.asList(n1, n2));

        notificationService.markAllAsRead(1L);

        assertTrue(n1.isRead());
        verify(notificationRepository).saveAll(anyList());
    }
}
