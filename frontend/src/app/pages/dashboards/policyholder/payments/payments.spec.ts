import 'zone.js';
import 'zone.js/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { PaymentsComponent } from './payments';
import { PaymentService } from '../../../../services/payment';
import { AuthService } from '../../../../services/auth';
import { InvoiceGeneratorService } from '../../../../services/invoice-generator';

describe('Policyholder PaymentsComponent', () => {
    let component: PaymentsComponent;
    let fixture: ComponentFixture<PaymentsComponent>;
    let paymentService: any;
    let authService: any;
    let invoiceService: any;

    const mockPayments = [
        { id: 1, amount: 100, paymentDate: '2025-01-01', paymentMethod: 'CARD', status: 'SUCCESS' },
        { id: 2, amount: 200, paymentDate: '2025-02-01', paymentMethod: 'CARD', status: 'SUCCESS' }
    ];

    const mockUser = { id: 1, fullName: 'John Doe' };

    beforeEach(async () => {
        paymentService = { getPaymentsByUserId: vi.fn() };
        authService = { currentUser: vi.fn() };
        invoiceService = { generateInvoice: vi.fn() };

        await TestBed.configureTestingModule({
            imports: [PaymentsComponent, HttpClientTestingModule],
            providers: [
                { provide: PaymentService, useValue: paymentService },
                { provide: AuthService, useValue: authService },
                { provide: InvoiceGeneratorService, useValue: invoiceService }
            ]
        }).compileComponents();

        authService.currentUser.mockReturnValue(mockUser);
        paymentService.getPaymentsByUserId.mockReturnValue(of(mockPayments as any[]));

        fixture = TestBed.createComponent(PaymentsComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });

    it('should load payments on init', () => {
        fixture.detectChanges();
        expect(paymentService.getPaymentsByUserId).toHaveBeenCalledWith(1);
        expect(component.payments()).toEqual(mockPayments as any[]);
    });

    it('should handle payment loading error', () => {
        paymentService.getPaymentsByUserId.mockReturnValue(throwError(() => new Error('Error')));
        fixture.detectChanges();
        expect(component.payments().length).toBe(0);
    });

    it('should call invoiceService when downloading invoice', () => {
        const payment = mockPayments[0] as any;
        component.downloadInvoice(payment);
        expect(invoiceService.generateInvoice).toHaveBeenCalledWith(payment, 'John Doe');
    });

    it('should use fallback name if fullName is missing', () => {
        authService.currentUser.mockReturnValue({ id: 1, name: 'Fallback Name' } as any);
        const payment = mockPayments[0] as any;
        component.downloadInvoice(payment);
        expect(invoiceService.generateInvoice).toHaveBeenCalledWith(payment, 'Fallback Name');
    });

    it('should use default name if no user name is found', () => {
        authService.currentUser.and?.returnValue ? authService.currentUser.and.returnValue({ id: 1 } as any) : authService.currentUser.mockReturnValue({ id: 1 } as any);
        const payment = mockPayments[0] as any;
        component.downloadInvoice(payment);
        expect(invoiceService.generateInvoice).toHaveBeenCalledWith(payment, 'Valued Client');
    });

    it('should not load payments if no user id', () => {
        authService.currentUser.mockReturnValue(null);
        fixture.detectChanges();
        expect(paymentService.getPaymentsByUserId).not.toHaveBeenCalled();
    });
});
