import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentService, Payment } from '../../../../services/payment';
import { AuthService } from '../../../../services/auth';
import { InvoiceGeneratorService } from '../../../../services/invoice-generator';

@Component({
    selector: 'app-policyholder-payments',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './payments.html',
    styleUrl: './payments.css'
})
export class PaymentsComponent implements OnInit {
    private paymentService = inject(PaymentService);
    private authService = inject(AuthService);
    private invoiceService = inject(InvoiceGeneratorService);

    payments = signal<Payment[]>([]);

    ngOnInit() {
        this.loadPayments();
    }

    loadPayments() {
        const user = this.authService.currentUser();
        if (user && user.id) {
            this.paymentService.getPaymentsByUserId(user.id).subscribe({
                next: (res) => {
                    this.payments.set(res || []);
                    console.log('Payments loaded:', res);
                },
                error: (err) => console.error('Failed to load payments', err)
            });
        }
    }

    downloadInvoice(payment: Payment) {
        const user = this.authService.currentUser();
        const name = user?.fullName || user?.name || user?.username || 'Valued Client';
        this.invoiceService.generateInvoice(payment, name);
    }
}
