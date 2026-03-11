package com.example.comproject.service;

import com.example.comproject.dto.NotificationDTO;
import com.example.comproject.entity.Notification;
import com.example.comproject.entity.User;
import com.example.comproject.exception.ResourceNotFoundException;
import com.example.comproject.repository.NotificationRepository;
import com.example.comproject.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AppNotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public AppNotificationService(NotificationRepository notificationRepository,
                                  UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    /**
     * Creates and persists a notification for a single recipient.
     */
    public void notify(User recipient, String message, String type) {
        Notification n = new Notification();
        n.setRecipient(recipient);
        n.setMessage(message);
        n.setType(type);
        n.setRead(false);
        notificationRepository.save(n);
    }

    /**
     * Bulk-notify all users with a given role.
     */
    public void notifyAllByRole(User.Role role, String message, String type) {
        List<User> users = userRepository.findAll().stream()
                .filter(u -> u.getRole() == role && u.getStatus() == User.Status.ACTIVE)
                .collect(Collectors.toList());
        for (User u : users) {
            notify(u, message, type);
        }
    }

    /**
     * Returns all notifications for a user (newest first).
     */
    public List<NotificationDTO> getNotificationsForUser(Long userId) {
        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(userId)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    /**
     * Returns unread notification count for a user.
     */
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByRecipientIdAndIsReadFalse(userId);
    }

    /**
     * Marks a single notification as read.
     */
    public void markAsRead(Long notificationId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            n.setRead(true);
            notificationRepository.save(n);
        });
    }

    /**
     * Marks all notifications for a user as read.
     */
    public void markAllAsRead(Long userId) {
        List<Notification> unread = notificationRepository
                .findByRecipientIdOrderByCreatedAtDesc(userId)
                .stream().filter(n -> !n.isRead()).collect(Collectors.toList());
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }

    private NotificationDTO toDTO(Notification n) {
        NotificationDTO dto = new NotificationDTO();
        dto.setId(n.getId());
        dto.setMessage(n.getMessage());
        dto.setType(n.getType());
        dto.setRead(n.isRead());
        dto.setCreatedAt(n.getCreatedAt());
        return dto;
    }
}
