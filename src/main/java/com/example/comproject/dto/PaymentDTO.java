package com.example.comproject.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.example.comproject.entity.Payment;

public class PaymentDTO {
    private Long id;
    private Long policyApplicationId;
    private BigDecimal amount;
    private LocalDateTime paymentDate;
    // private Payment.PaymentMethod paymentMethod;
    private String transactionReference;
    private Payment.PaymentType paymentType;
    private Payment.PaymentStatus status;
    private String policyNumber;
    private String planName;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getPolicyApplicationId() { return policyApplicationId; }
    public void setPolicyApplicationId(Long policyApplicationId) { this.policyApplicationId = policyApplicationId; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public LocalDateTime getPaymentDate() { return paymentDate; }
    public void setPaymentDate(LocalDateTime paymentDate) { this.paymentDate = paymentDate; }
    // public Payment.PaymentMethod getPaymentMethod() { return paymentMethod; }
    // public void setPaymentMethod(Payment.PaymentMethod paymentMethod) { this.paymentMethod = paymentMethod; }
    public String getTransactionReference() { return transactionReference; }
    public void setTransactionReference(String transactionReference) { this.transactionReference = transactionReference; }
    public Payment.PaymentType getPaymentType() { return paymentType; }
    public void setPaymentType(Payment.PaymentType paymentType) { this.paymentType = paymentType; }
    public Payment.PaymentStatus getStatus() { return status; }
    public void setStatus(Payment.PaymentStatus status) { this.status = status; }
    public String getPolicyNumber() { return policyNumber; }
    public void setPolicyNumber(String policyNumber) { this.policyNumber = policyNumber; }
    public String getPlanName() { return planName; }
    public void setPlanName(String planName) { this.planName = planName; }
}
