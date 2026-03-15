import 'zone.js';
import 'zone.js/testing';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { ApplicationsComponent } from './applications';
import { PolicyApplicationService } from '../../../../services/policy-application';
import { PaymentService } from '../../../../services/payment';
import { AuthService } from '../../../../services/auth';
import { NotificationService } from '../../../../services/notification';
import { ClaimService } from '../../../../services/claim';

describe('Policyholder ApplicationsComponent', () => {
    let component: ApplicationsComponent;
    let fixture: ComponentFixture<ApplicationsComponent>;
    let policyAppService: any;
    let authService: any;
    let paymentService: any;
    let notificationService: any;
    let claimService: any;

    const mockApplications = [
        { id: 1, status: 'APPROVED', premiumAmount: 500, policyName: 'Policy A', selectedCoverageAmount: 10000, totalSettledAmount: 0 },
        { id: 2, status: 'ACTIVE', premiumAmount: 600, policyName: 'Policy B', nextPaymentDueDate: '2025-01-01', selectedCoverageAmount: 20000, totalSettledAmount: 5000 },
        { id: 3, status: 'REJECTED', policyName: 'Policy C' }
    ];

    const mockUser = { id: 1, email: 'user@test.com' };

    beforeEach(async () => {
        policyAppService = { getApplicationsByUserId: vi.fn() };
        authService = { currentUser: vi.fn() };
        paymentService = { createPayment: vi.fn() };
        notificationService = { show: vi.fn() };
        claimService = { createClaim: vi.fn() };

        await TestBed.configureTestingModule({
            imports: [ApplicationsComponent, HttpClientTestingModule],
            providers: [
                { provide: PolicyApplicationService, useValue: policyAppService },
                { provide: AuthService, useValue: authService },
                { provide: PaymentService, useValue: paymentService },
                { provide: NotificationService, useValue: notificationService },
                { provide: ClaimService, useValue: claimService }
            ]
        }).compileComponents();

        authService.currentUser.mockReturnValue(mockUser);
        policyAppService.getApplicationsByUserId.mockReturnValue(of(mockApplications as any[]));

        fixture = TestBed.createComponent(ApplicationsComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });

    it('should load applications on init', () => {
        fixture.detectChanges();
        expect(policyAppService.getApplicationsByUserId).toHaveBeenCalledWith(1);
        expect(component.applications()).toEqual(mockApplications as any[]);
        expect(component.isLoading()).toBe(false);
    });

    it('should return correct background class for status', () => {
        expect(component.getStatusBg('ACTIVE')).toBe('bg-burgundy');
        expect(component.getStatusBg('REJECTED')).toBe('bg-rose-600');
        expect(component.getStatusBg('SUBMITTED')).toBe('bg-burgundy/40');
        expect(component.getStatusBg('UNKNOWN')).toBe('bg-slate-400');
    });

    it('should determine if payment is required', () => {
        const approvedApp = mockApplications[0] as any;
        expect(component.isPaymentRequired(approvedApp)).toBe(true);

        const activeAppPastDue = mockApplications[1] as any; // Due 2025-01-01
        expect(component.isPaymentRequired(activeAppPastDue)).toBe(true);

        const rejectedApp = mockApplications[2] as any;
        expect(component.isPaymentRequired(rejectedApp)).toBe(false);
    });

    it('should handle premium payment', () => {
        paymentService.createPayment.mockReturnValue(of({}));
        const app = mockApplications[0] as any;
        
        component.payPremium(app);
        
        expect(paymentService.createPayment).toHaveBeenCalled();
        expect(notificationService.show).toHaveBeenCalledWith(expect.stringMatching(/Payment Done/), 'success');
        expect(policyAppService.getApplicationsByUserId).toHaveBeenCalled(); // Reloaded
    });

    it('should handle payment error', () => {
        paymentService.createPayment.mockReturnValue(throwError(() => new Error('Failed')));
        const app = mockApplications[0] as any;
        
        component.payPremium(app);
        
        expect(notificationService.show).toHaveBeenCalledWith(expect.stringMatching(/Payment failed/), 'error');
    });

    it('should calculate available balance correctly', () => {
        const app = mockApplications[1] as any; // 20000 - 5000
        expect(component.getAvailableBalance(app)).toBe(15000);

        const appNoId = { selectedCoverageAmount: 1000, totalSettledAmount: 1200 };
        expect(component.getAvailableBalance(appNoId as any)).toBe(0);
    });

    it('should open claim modal and reset form', () => {
        const app = mockApplications[1] as any;
        component.openClaimModal(app);
        
        expect(component.selectedApp()).toEqual(app);
        expect(component.showClaimModal()).toBe(true);
        expect(component.claimForm.claimAmount).toBe(0);
        expect(component.selectedFiles.length).toBe(0);
    });

    it('should validate claim form before submission', () => {
        component.selectedApp.set(mockApplications[1] as any);
        component.claimForm = { incidentDate: '', incidentLocation: '', description: '', claimAmount: 0 };
        
        component.submitClaim();
        
        expect(component.formSubmitted()).toBe(true);
        expect(notificationService.show).toHaveBeenCalledWith(expect.stringMatching(/fill all required fields/), 'error');
        expect(claimService.createClaim).not.toHaveBeenCalled();
    });

    it('should successfully submit claim', () => {
        component.selectedApp.set(mockApplications[1] as any);
        component.claimForm = { 
            incidentDate: '2025-05-01', 
            incidentLocation: 'Office', 
            description: 'Theft', 
            claimAmount: 500 
        };
        claimService.createClaim.mockReturnValue(of({}));
        
        component.submitClaim();
        
        expect(claimService.createClaim).toHaveBeenCalled();
        expect(notificationService.show).toHaveBeenCalledWith(expect.stringMatching(/Claim submitted successfully/), 'success');
        expect(component.isSubmitting()).toBe(false);
        expect(component.showClaimModal()).toBe(false);
    });

    it('should handle claim submission error', () => {
        component.selectedApp.set(mockApplications[1] as any);
        component.claimForm = { 
            incidentDate: '2025-05-01', 
            incidentLocation: 'Office', 
            description: 'Theft', 
            claimAmount: 500 
        };
        claimService.createClaim.mockReturnValue(throwError(() => new Error('API Error')));
        
        component.submitClaim();
        
        expect(notificationService.show).toHaveBeenCalledWith(expect.stringMatching(/Failed to submit claim/), 'error');
        expect(component.isSubmitting()).toBe(false);
    });

    it('should handle file selection', () => {
        const mockFile = new File([''], 'test.png', { type: 'image/png' });
        const event = { target: { files: [mockFile] } };
        
        component.onFileSelected(event);
        expect(component.selectedFiles.length).toBe(1);
        expect(component.selectedFiles[0]).toBe(mockFile);
    });

    it('should close claim modal', () => {
        component.showClaimModal.set(true);
        component.closeClaimModal();
        expect(component.showClaimModal()).toBe(false);
        expect(component.selectedApp()).toBeNull();
    });
});
