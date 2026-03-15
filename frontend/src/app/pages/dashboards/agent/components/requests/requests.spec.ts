import 'zone.js';
import 'zone.js/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { RequestsComponent } from './requests';
import { PolicyApplicationService } from '../../../../../services/policy-application';
import { AuthService } from '../../../../../services/auth';
import { NotificationService } from '../../../../../services/notification';

describe('Agent RequestsComponent', () => {
    let component: RequestsComponent;
    let fixture: ComponentFixture<RequestsComponent>;
    let policyAppService: any;
    let authService: any;
    let notificationService: any;

    const mockRequests = [
        { id: 1, status: 'SUBMITTED', policyName: 'Policy A', fullName: 'User 1' },
        { id: 2, status: 'UNDER_REVIEW', policyName: 'Policy B', fullName: 'User 2' },
        { id: 3, status: 'APPROVED', policyName: 'Policy C', fullName: 'User 3' }
    ];

    const mockUser = { id: 101, fullName: 'Agent Agent' };

    beforeEach(async () => {
        policyAppService = {
            getApplicationsByAgentId: vi.fn(),
            approveApplication: vi.fn(),
            rejectApplication: vi.fn()
        };
        authService = {
            currentUser: vi.fn()
        };
        notificationService = {
            show: vi.fn()
        };

        await TestBed.configureTestingModule({
            imports: [RequestsComponent, HttpClientTestingModule],
            providers: [
                { provide: PolicyApplicationService, useValue: policyAppService },
                { provide: AuthService, useValue: authService },
                { provide: NotificationService, useValue: notificationService }
            ]
        }).compileComponents();

        authService.currentUser.mockReturnValue(mockUser);
        policyAppService.getApplicationsByAgentId.mockReturnValue(of(mockRequests as any[]));

        fixture = TestBed.createComponent(RequestsComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });

    it('should load agent requests on init', () => {
        fixture.detectChanges();
        expect(policyAppService.getApplicationsByAgentId).toHaveBeenCalledWith(101);
        expect(component.requests().length).toBe(3);
    });

    it('should calculate pendingCount correctly', () => {
        fixture.detectChanges();
        expect(component.pendingCount()).toBe(2); // SUBMITTED and UNDER_REVIEW
    });

    it('should open review modal', () => {
        const req = mockRequests[0] as any;
        component.openReview(req);
        expect(component.selectedReq()).toEqual(req);
        expect(component.isRejecting()).toBe(false);
        expect(component.rejectionReason).toBe('');
    });

    it('should close review modal', () => {
        component.selectedReq.set(mockRequests[0] as any);
        component.closeReview();
        expect(component.selectedReq()).toBeNull();
    });

    it('should approve application', () => {
        const req = mockRequests[0] as any;
        component.selectedReq.set(req);
        policyAppService.approveApplication.mockReturnValue(of({}));
        
        component.approve();
        
        expect(policyAppService.approveApplication).toHaveBeenCalledWith(req.id);
        expect(notificationService.show).toHaveBeenCalledWith(expect.stringMatching(/approved successfully/), 'success');
        expect(component.selectedReq()).toBeNull();
        expect(policyAppService.getApplicationsByAgentId).toHaveBeenCalled();
    });

    it('should handle approval error', () => {
        component.selectedReq.set(mockRequests[0] as any);
        policyAppService.approveApplication.mockReturnValue(throwError(() => ({ error: { message: 'Failed' } })));
        
        component.approve();
        
        expect(notificationService.show).toHaveBeenCalledWith('Failed', 'error');
    });

    it('should reject application with reason', () => {
        const req = mockRequests[0] as any;
        component.selectedReq.set(req);
        component.rejectionReason = 'Incomplete docs';
        policyAppService.rejectApplication.mockReturnValue(of({}));
        
        component.confirmReject();
        
        expect(policyAppService.rejectApplication).toHaveBeenCalledWith(req.id, 'Incomplete docs');
        expect(notificationService.show).toHaveBeenCalledWith(expect.stringMatching(/rejected/), 'info');
        expect(component.selectedReq()).toBeNull();
    });

    it('should handle rejection error', () => {
        component.selectedReq.set(mockRequests[0] as any);
        component.rejectionReason = 'Reason';
        policyAppService.rejectApplication.mockReturnValue(throwError(() => new Error('Error')));
        
        component.confirmReject();
        
        expect(notificationService.show).toHaveBeenCalledWith(expect.stringMatching(/Rejection failed/), 'error');
    });

    it('should not call reject if reason is missing', () => {
        component.selectedReq.set(mockRequests[0] as any);
        component.rejectionReason = '';
        
        component.confirmReject();
        
        expect(policyAppService.rejectApplication).not.toHaveBeenCalled();
    });
});
