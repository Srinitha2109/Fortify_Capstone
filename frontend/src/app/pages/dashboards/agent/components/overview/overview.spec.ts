import 'zone.js';
import 'zone.js/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { OverviewComponent } from './overview';
import { PolicyApplicationService } from '../../../../../services/policy-application';
import { AuthService } from '../../../../../services/auth';
import { NotificationService } from '../../../../../services/notification';

describe('Agent OverviewComponent', () => {
    let component: OverviewComponent;
    let fixture: ComponentFixture<OverviewComponent>;
    let policyAppService: any;
    let authService: any;
    let notificationService: any;

    const mockUser = { id: 101, fullName: 'John Agent' };
    const mockRequests = [
        { id: 1, status: 'SUBMITTED' },
        { id: 2, status: 'UNDER_REVIEW' },
        { id: 3, status: 'APPROVED' },
        { id: 4, status: 'ACTIVE' },
        { id: 5, status: 'REJECTED' },
        { id: 6, status: 'SUBMITTED' }
    ];

    beforeEach(async () => {
        policyAppService = {
            getApplicationsByAgentId: vi.fn()
        };
        authService = {
            currentUser: vi.fn()
        };
        notificationService = {
            show: vi.fn()
        };

        await TestBed.configureTestingModule({
            imports: [OverviewComponent, HttpClientTestingModule, RouterTestingModule],
            providers: [
                { provide: PolicyApplicationService, useValue: policyAppService },
                { provide: AuthService, useValue: authService },
                { provide: NotificationService, useValue: notificationService }
            ]
        }).compileComponents();

        authService.currentUser.mockReturnValue(mockUser);
        policyAppService.getApplicationsByAgentId.mockReturnValue(of(mockRequests as any[]));

        fixture = TestBed.createComponent(OverviewComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });

    it('should load applications on init', () => {
        fixture.detectChanges();
        expect(authService.currentUser).toHaveBeenCalled();
        expect(policyAppService.getApplicationsByAgentId).toHaveBeenCalledWith(101);
        expect(component.requests().length).toBe(6);
    });

    it('should calculate pending and approved counts correctly', () => {
        fixture.detectChanges();
        expect(component.pendingCount()).toBe(3); // 2 SUBMITTED + 1 UNDER_REVIEW
        expect(component.approvedCount()).toBe(2); // 1 APPROVED + 1 ACTIVE
    });

    it('should slice recent requests to 5', () => {
        fixture.detectChanges();
        expect(component.recentRequests().length).toBe(5);
    });

    it('should generate correct initials', () => {
        expect(component.getInitials('John Doe')).toBe('JD');
        expect(component.getInitials('Agent')).toBe('A');
        expect(component.getInitials('')).toBe('AG');
        expect(component.getInitials(undefined)).toBe('AG');
    });

    it('should handle error when loading applications', () => {
        policyAppService.getApplicationsByAgentId.mockReturnValue(throwError(() => new Error('Error')));
        fixture.detectChanges();
        expect(notificationService.show).toHaveBeenCalledWith(expect.any(String), 'error');
    });
});
