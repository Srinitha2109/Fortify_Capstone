package com.example.comproject.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmailServiceTest {

    @Mock
    private JavaMailSender mailSender;

    @InjectMocks
    private EmailService emailService;

    @Test
    void testSendWelcomeEmail() {
        emailService.sendWelcomeEmail("test@example.com", "John Doe", "pass123");

        verify(mailSender, times(1)).send(any(SimpleMailMessage.class));
    }

    @Test
    void testSendRejectionEmail() {
        emailService.sendRejectionEmail("test@example.com", "John Doe", "Missing documents");

        verify(mailSender, times(1)).send(any(SimpleMailMessage.class));
    }

    @Test
    void testSendEmailWhenMailSenderIsNull() {
        // Create service with null mailSender
        EmailService serviceWithNullSender = new EmailService();
        
        // Should not throw exception
        serviceWithNullSender.sendWelcomeEmail("test@example.com", "John Doe", "pass123");
        
        // Success if no exception
    }
}
