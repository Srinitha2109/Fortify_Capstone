package com.example.comproject.controller;

import com.example.comproject.dto.NotificationDTO;
import com.example.comproject.service.AppNotificationService;
import com.example.comproject.entity.User;
import com.example.comproject.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final AppNotificationService notificationService;
    private final UserRepository userRepository;

    public NotificationController(AppNotificationService notificationService,
            UserRepository userRepository) {
        this.notificationService = notificationService;
        this.userRepository = userRepository;
    }

    // Get all notifications for the currently logged-in user
    @GetMapping("/my/{userId}")
    public ResponseEntity<List<NotificationDTO>> getMyNotifications(@PathVariable Long userId) {
        return ResponseEntity.ok(notificationService.getNotificationsForUser(userId));
    }

    // Get unread count for a user
    @GetMapping("/my/{userId}/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(@PathVariable Long userId) {
        return ResponseEntity.ok(Map.of("count", notificationService.getUnreadCount(userId)));
    }

    // Mark a specific notification as read
    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok().build();
    }

    // Mark all notifications for a user as read
    @PutMapping("/my/{userId}/read-all")
    public ResponseEntity<Void> markAllAsRead(@PathVariable Long userId) {
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok().build();
    }
}
