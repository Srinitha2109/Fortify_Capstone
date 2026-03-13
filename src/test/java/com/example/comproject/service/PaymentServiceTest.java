package com.example.comproject.service;

import com.example.comproject.dto.PaymentDTO;
import com.example.comproject.entity.Payment;
import com.example.comproject.entity.PolicyApplication;
import com.example.comproject.repository.PaymentRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    @Mock
    private PaymentRepository paymentRepository;

    @InjectMocks
    private PaymentService paymentService;

    @Test
    void testGetAllPayments() {
        Payment payment = new Payment();
        payment.setId(1L);
        payment.setAmount(new BigDecimal("500.00"));
        PolicyApplication app = new PolicyApplication();
        app.setId(10L);
        payment.setPolicyApplication(app);

        when(paymentRepository.findAll()).thenReturn(Arrays.asList(payment));

        List<PaymentDTO> result = paymentService.getAllPayments();

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(new BigDecimal("500.00"), result.get(0).getAmount());
    }

    @Test
    void testGetPaymentById() {
        Payment payment = new Payment();
        payment.setId(1L);
        payment.setAmount(new BigDecimal("500.00"));
        PolicyApplication app = new PolicyApplication();
        app.setId(10L);
        payment.setPolicyApplication(app);

        when(paymentRepository.findById(1L)).thenReturn(Optional.of(payment));

        PaymentDTO result = paymentService.getPaymentById(1L);

        assertNotNull(result);
        assertEquals(new BigDecimal("500.00"), result.getAmount());
    }
}
