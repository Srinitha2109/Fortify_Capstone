package com.example.comproject.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.comproject.dto.PaymentDTO;
import com.example.comproject.entity.Payment;
import com.example.comproject.repository.PaymentRepository;
import com.example.comproject.repository.PolicyApplicationRepository;

@Service
public class PaymentService {
    private final PaymentRepository paymentRepository;
    private final PolicyApplicationRepository policyApplicationRepository;

    public PaymentService(PaymentRepository paymentRepository, PolicyApplicationRepository policyApplicationRepository) {
        this.paymentRepository = paymentRepository;
        this.policyApplicationRepository = policyApplicationRepository;
    }

    public PaymentDTO createPayment(PaymentDTO dto) {
        com.example.comproject.entity.PolicyApplication application = policyApplicationRepository.findById(dto.getPolicyApplicationId())
                .orElseThrow(() -> new com.example.comproject.exception.ResourceNotFoundException("Application not found"));

        if (application.getStatus() != com.example.comproject.entity.PolicyApplication.ApplicationStatus.APPROVED && 
            application.getStatus() != com.example.comproject.entity.PolicyApplication.ApplicationStatus.ACTIVE) {
            throw new RuntimeException("Can only pay for approved or active policies");
        }

        Payment payment = new Payment();
        payment.setPolicyApplication(application);
        payment.setAmount(dto.getAmount());
        payment.setPaymentDate(LocalDateTime.now());
        // payment.setPaymentMethod(dto.getPaymentMethod());
        payment.setTransactionReference(generateTransactionReference());
        payment.setPaymentType(dto.getPaymentType() != null ? dto.getPaymentType() : Payment.PaymentType.PREMIUM);
        payment.setStatus(Payment.PaymentStatus.SUCCESS);

        // Transition status to ACTIVE if it was APPROVED
        if (application.getStatus() == com.example.comproject.entity.PolicyApplication.ApplicationStatus.APPROVED) {
            application.setStatus(com.example.comproject.entity.PolicyApplication.ApplicationStatus.ACTIVE);
            if (application.getStartDate() == null) {
                application.setStartDate(java.time.LocalDate.now());
                application.setEndDate(java.time.LocalDate.now().plusYears(1)); // Default 1 year
            }
        }

        // Calculate next payment due date
        java.time.LocalDate nextDue = application.getNextPaymentDueDate() != null ? 
                application.getNextPaymentDueDate() : application.getStartDate();
        
        switch (application.getPaymentPlan()) {
            case ANNUALLY:
                application.setNextPaymentDueDate(nextDue.plusYears(1));
                break;
            case SIX_MONTHS:
                application.setNextPaymentDueDate(nextDue.plusMonths(6));
                break;
            case MONTHLY:
            default:
                application.setNextPaymentDueDate(nextDue.plusMonths(1));
                break;
        }

        policyApplicationRepository.save(application);
        return toDTO(paymentRepository.save(payment));
    }

    private String generateTransactionReference() {
        return "TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    public PaymentDTO getPaymentById(Long id) {
        return paymentRepository.findById(id).map(this::toDTO).orElse(null);
    }

    public List<PaymentDTO> getPaymentsByPolicyApplication(Long policyApplicationId) {
        return paymentRepository.findByPolicyApplicationId(policyApplicationId).stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<PaymentDTO> getPaymentsByUserId(Long userId) {
        return paymentRepository.findByUserId(userId).stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<PaymentDTO> getAllPayments() {
        return paymentRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    private PaymentDTO toDTO(Payment payment) {
        PaymentDTO dto = new PaymentDTO();
        dto.setId(payment.getId());
        dto.setPolicyApplicationId(payment.getPolicyApplication().getId());
        dto.setAmount(payment.getAmount());
        dto.setPaymentDate(payment.getPaymentDate());
        // dto.setPaymentMethod(payment.getPaymentMethod());
        dto.setTransactionReference(payment.getTransactionReference());
        dto.setPaymentType(payment.getPaymentType());
        dto.setStatus(payment.getStatus());
        dto.setPolicyNumber(payment.getPolicyApplication().getPolicyNumber());
        if (payment.getPolicyApplication().getPlan() != null) {
            dto.setPlanName(payment.getPolicyApplication().getPlan().getPolicyName());
        }
        return dto;
    }
}
