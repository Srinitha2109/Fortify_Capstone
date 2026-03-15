package com.example.comproject.controller;

import com.example.comproject.dto.PaymentDTO;
import com.example.comproject.service.PaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {
    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PreAuthorize("hasAnyRole('POLICYHOLDER', 'ADMIN')")
    @PostMapping
    public ResponseEntity<PaymentDTO> createPayment(@RequestBody PaymentDTO payment) {
        return ResponseEntity.ok(paymentService.createPayment(payment));
    }

    @PreAuthorize("hasAnyRole('POLICYHOLDER', 'ADMIN', 'AGENT')")
    @GetMapping("/{id}")
    public ResponseEntity<PaymentDTO> getPaymentById(@PathVariable Long id) {
        PaymentDTO payment = paymentService.getPaymentById(id);
        return payment != null ? ResponseEntity.ok(payment) : ResponseEntity.notFound().build();
    }

    @PreAuthorize("hasAnyRole('POLICYHOLDER', 'ADMIN', 'AGENT')")
    @GetMapping("/policy-application/{policyApplicationId}")
    public ResponseEntity<List<PaymentDTO>> getPaymentsByPolicyApplication(@PathVariable Long policyApplicationId) {
        return ResponseEntity.ok(paymentService.getPaymentsByPolicyApplication(policyApplicationId));
    }

    @PreAuthorize("hasAnyRole('POLICYHOLDER', 'ADMIN', 'AGENT')")
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<PaymentDTO>> getPaymentsByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(paymentService.getPaymentsByUserId(userId));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<List<PaymentDTO>> getAllPayments() {
        return ResponseEntity.ok(paymentService.getAllPayments());
    }
}
