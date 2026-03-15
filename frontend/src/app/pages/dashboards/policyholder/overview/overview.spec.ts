import 'zone.js';
import 'zone.js/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { OverviewComponent } from './overview';
import { PolicyService } from '../../../../services/policy';
import { AuthService } from '../../../../services/auth';

describe('Policyholder OverviewComponent', () => {
    let component: OverviewComponent;
    let fixture: ComponentFixture<OverviewComponent>;
    let policyService: any;
    let authService: any;
    let httpMock: HttpTestingController;

    const mockPolicies = [
        { id: 1, policyName: 'Policy A', isActive: true },
        { id: 2, policyName: 'Policy B', isActive: true }
    ];

    const mockUser = { id: 1, userId: 1, email: 'test@example.com' };

    beforeEach(async () => {
        policyService = { getActivePolicies: vi.fn() };
        authService = { currentUser: vi.fn() };

        await TestBed.configureTestingModule({
            imports: [OverviewComponent, HttpClientTestingModule, RouterTestingModule],
            providers: [
                { provide: PolicyService, useValue: policyService },
                { provide: AuthService, useValue: authService }
            ]
        }).compileComponents();

        httpMock = TestBed.inject(HttpTestingController);
        authService.currentUser.mockReturnValue(mockUser);
        policyService.getActivePolicies.mockReturnValue(of(mockPolicies as any[]));

        fixture = TestBed.createComponent(OverviewComponent);
        component = fixture.componentInstance;
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should create', () => {
        fixture.detectChanges();
        const req = httpMock.expectOne('/api/policyholder/my-applications/1');
        req.flush([]);
        expect(component).toBeTruthy();
    });

    it('should fetch data and calculate counts correctly', () => {
        fixture.detectChanges(); // ngOnInit

        expect(policyService.getActivePolicies).toHaveBeenCalled();
        expect(component.activePoliciesCount()).toBe(2);

        const req = httpMock.expectOne('/api/policyholder/my-applications/1');
        req.flush([
            { id: 101, status: 'SUBMITTED' },
            { id: 102, status: 'UNDER_REVIEW' },
            { id: 103, status: 'ACTIVE' }
        ]);

        expect(component.pendingApplicationsCount()).toBe(2);
        expect(component.isLoading()).toBe(false);
    });

    it('should handle missing userId', () => {
        authService.currentUser.mockReturnValue({ ...mockUser, userId: undefined } as any);
        fixture.detectChanges();
        
        expect(component.isLoading()).toBe(false);
        expect(component.pendingApplicationsCount()).toBe(0);
    });

    it('should handle policy fetch error', () => {
        policyService.getActivePolicies.mockReturnValue(throwError(() => new Error('API Error')));
        fixture.detectChanges();
        
        expect(component.isLoading()).toBe(false);
        expect(component.activePoliciesCount()).toBe(0);
    });

    it('should handle application fetch error', () => {
        fixture.detectChanges();
        
        const req = httpMock.expectOne('/api/policyholder/my-applications/1');
        req.error(new ErrorEvent('Network error'));
        
        expect(component.isLoading()).toBe(false);
        expect(component.pendingApplicationsCount()).toBe(0);
    });
});
