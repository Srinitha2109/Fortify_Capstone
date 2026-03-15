package com.example.comproject.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    
    @Autowired(required = false)
    private JavaMailSender mailSender;
    
    public void sendWelcomeEmail(String toEmail, String fullName, String tempPassword) {
        System.out.println("Full Name: " + fullName);
        System.out.println("Email    : " + toEmail);
        System.out.println("Password : " + tempPassword);
        
        if (mailSender == null) {
            System.out.println("Email service not configured. Would send welcome email to: " + toEmail);
            System.out.println("Credentials - Email: " + toEmail + ", Password: " + tempPassword);
            return;
        }
        
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject("Welcome to Fortify Insurance - Account Approved");
            message.setText(buildWelcomeEmailBody(fullName, toEmail, tempPassword));
            message.setFrom("noreply@fortifyinsurance.com");
            
            mailSender.send(message);
            System.out.println("Welcome email sent to: " + toEmail);
        } catch (Exception e) {
            System.err.println("Failed to send email to: " + toEmail + " - " + e.getMessage());
        }
    }
    
    public void sendRejectionEmail(String toEmail, String fullName, String reason) {
        if (mailSender == null) {
            System.out.println("Email service not configured. Would send rejection email to: " + toEmail);
            System.out.println("Reason: " + reason);
            return;
        }
        
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject("Shield Insurance - Registration Update");
            message.setText(buildRejectionEmailBody(fullName, reason));
            message.setFrom("noreply@shieldinsurance.com");
            
            mailSender.send(message);
            System.out.println("Rejection email sent to: " + toEmail);
        } catch (Exception e) {
            System.err.println("Failed to send rejection email to: " + toEmail + " - " + e.getMessage());
        }
    }
    
    private String buildWelcomeEmailBody(String fullName, String email, String password) {
        return String.format("""
            Dear %s,
            
            Congratulations! Your registration with Fortify Insurance has been approved.
            
            Your login credentials are:
            Email: %s
            Password: %s

            For security reasons, we recommend changing your password after first login.
            
            Welcome to Fortify Insurance!
            
            Best regards,
            Fortify Insurance Team
            """, fullName, email, password);
    }

    public void sendOtpEmail(String toEmail, String otp) {
        if (mailSender == null) {
            System.out.println("Email service not configured. Would send OTP to: " + toEmail);
            System.out.println("OTP: " + otp);
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject("Fortify Insurance - Password Reset OTP");
            message.setText("Your OTP for resetting your password is: " + otp + "\n\nThis OTP is valid for a short time. Please do not share it with anyone.");
            message.setFrom("noreply@fortifyinsurance.com");
            
            mailSender.send(message);
            System.out.println("OTP email sent to: " + toEmail);
        } catch (Exception e) {
            System.err.println("Failed to send OTP email to: " + toEmail + " - " + e.getMessage());
        }
    }
    
    private String buildRejectionEmailBody(String fullName, String reason) {
        return String.format("""
            Dear %s,
            
            Thank you for your interest in Fortify Insurance.
            
            Unfortunately, we cannot approve your registration at this time.
            
            Reason: %s
            
            If you have any questions, please contact our support team.
            
            Best regards,
            Fortify Insurance Team
            """, fullName, reason);
    }
}