package com.example.comproject.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "policy_application_id")
    private PolicyApplication policyApplication;

    private BigDecimal amount;
    private LocalDateTime paymentDate;

    // @Enumerated(EnumType.STRING)
    // private PaymentMethod paymentMethod;

    private String transactionReference;

    @Enumerated(EnumType.STRING)
    private PaymentType paymentType;

    @Enumerated(EnumType.STRING)
    private PaymentStatus status;

    // public enum PaymentMethod {
    //     CARD, BANK_TRANSFER, ONLINE, CHECK
    // }

    public enum PaymentType {
        PREMIUM, SETTLEMENT, REFUND
    }

    public enum PaymentStatus {
        PENDING, SUCCESS, FAILED
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public PolicyApplication getPolicyApplication() { return policyApplication; }
    public void setPolicyApplication(PolicyApplication policyApplication) { this.policyApplication = policyApplication; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public LocalDateTime getPaymentDate() { return paymentDate; }
    public void setPaymentDate(LocalDateTime paymentDate) { this.paymentDate = paymentDate; }
    // public PaymentMethod getPaymentMethod() { return paymentMethod; }
    // public void setPaymentMethod(PaymentMethod paymentMethod) { this.paymentMethod = paymentMethod; }
    public String getTransactionReference() { return transactionReference; }
    public void setTransactionReference(String transactionReference) { this.transactionReference = transactionReference; }
    public PaymentType getPaymentType() { return paymentType; }
    public void setPaymentType(PaymentType paymentType) { this.paymentType = paymentType; }
    public PaymentStatus getStatus() { return status; }
    public void setStatus(PaymentStatus status) { this.status = status; }
}
