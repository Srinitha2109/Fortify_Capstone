import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { PoliciesComponent } from './policies';
import { PolicyService } from '../../../../services/policy';
import { AuthService } from '../../../../services/auth';
import { BusinessProfileService } from '../../../../services/business-profile';
import { PolicyApplicationService } from '../../../../services/policy-application';
import { NotificationService } from '../../../../services/notification';
import { PolicySearchService } from '../../../../services/policy-search.service';

describe('Policyholder PoliciesComponent', () => {
    let component: PoliciesComponent;
    let fixture: ComponentFixture<PoliciesComponent>;
    let policyService: any;
    let authService: any;
    let businessProfileService: any;
    let policyAppService: any;
    let notificationService: any;
    let policySearchService: PolicySearchService;

    const mockPolicies = [
        { id: 1, policyName: 'Policy A', description: 'desc A', insuranceType: 'TYPE1', isActive: true, minCoverageAmount: 1000, maxCoverageAmount: 5000, basePremium: 100, durationMonths: 12 },
        { id: 2, policyName: 'Policy B', description: 'desc B', insuranceType: 'TYPE2', isActive: true, minCoverageAmount: 2000, maxCoverageAmount: 10000, basePremium: 200, durationMonths: 24 },
        { id: 3, policyName: 'Inactive', isActive: false }
    ];

    const mockUser = { id: 1, email: 'test@example.com' };
    const mockProfile = { id: 1, userId: 1, agentId: 101, businessName: 'Test Biz' };

    beforeEach(async () => {
        policyService = { getAllPolicies: vi.fn() };
        authService = { currentUser: vi.fn() };
        businessProfileService = { getProfileByUserId: vi.fn() };
        policyAppService = {
            getApplicationsByUserId: vi.fn(),
            calculatePremiumPreview: vi.fn(),
            createApplication: vi.fn()
        };
        notificationService = { show: vi.fn() };

        await TestBed.configureTestingModule({
            imports: [PoliciesComponent, HttpClientTestingModule],
            providers: [
                { provide: PolicyService, useValue: policyService },
                { provide: AuthService, useValue: authService },
                { provide: BusinessProfileService, useValue: businessProfileService },
                { provide: PolicyApplicationService, useValue: policyAppService },
                { provide: NotificationService, useValue: notificationService },
                PolicySearchService
            ]
        }).compileComponents();

        policySearchService = TestBed.inject(PolicySearchService);
        authService.currentUser.mockReturnValue(mockUser);
        policyService.getAllPolicies.mockReturnValue(of(mockPolicies as any[]));
        businessProfileService.getProfileByUserId.mockReturnValue(of(mockProfile as any));
        policyAppService.getApplicationsByUserId.mockReturnValue(of([]));

        fixture = TestBed.createComponent(PoliciesComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should load policies, profile, and apps on init', fakeAsync(() => {
        fixture.detectChanges(); // ngOnInit
        tick(3000); // For the setTimeout in loadPolicies

        expect(policyService.getAllPolicies).toHaveBeenCalled();
        expect(businessProfileService.getProfileByUserId).toHaveBeenCalledWith(1);
        expect(policyAppService.getApplicationsByUserId).toHaveBeenCalledWith(1);
        expect(component.allPolicies().length).toBe(2); // Only active ones
        expect(component.isLoading()).toBe(false);
    }));

    it('should filter policies based on search query', fakeAsync(() => {
        fixture.detectChanges();
        tick(3000);

        policySearchService.setQuery('Policy A');
        fixture.detectChanges();
        expect(component.filteredPolicies().length).toBe(1);
        expect(component.filteredPolicies()[0].policyName).toBe('Policy A');

        policySearchService.setQuery('desc B');
        fixture.detectChanges();
        expect(component.filteredPolicies().length).toBe(1);
        expect(component.filteredPolicies()[0].policyName).toBe('Policy B');
    }));

    it('should handle pagination', fakeAsync(() => {
        // Create 10 policies to test pagination (pageSize is 6)
        const manyPolicies = Array.from({ length: 10 }, (_, i) => ({
            id: i, policyName: `P${i}`, isActive: true, minCoverageAmount: 100
        }));
        policyService.getAllPolicies.mockReturnValue(of(manyPolicies as any[]));
        
        fixture.detectChanges();
        tick(3000);

        expect(component.paginatedPolicies().length).toBe(6);
        expect(component.totalPages()).toBe(2);

        component.changePage(2);
        expect(component.currentPage()).toBe(2);
        expect(component.paginatedPolicies().length).toBe(4);
    }));

    it('should show warning if business profile is missing when selecting policy', () => {
        component.businessProfile.set(null);
        component.selectPolicy(mockPolicies[0] as any);
        expect(notificationService.show).toHaveBeenCalledWith(expect.stringMatching(/profile is not set up/), 'warning');
    });

    it('should show info if agent is not assigned when selecting policy', () => {
        component.businessProfile.set({ ...mockProfile, agentId: null } as any);
        component.selectPolicy(mockPolicies[0] as any);
        expect(notificationService.show).toHaveBeenCalledWith(expect.stringMatching(/pending professional staff assignment/), 'info');
    });

    it('should set selected policy and preview premium if valid', () => {
        component.businessProfile.set(mockProfile as any);
        policyAppService.calculatePremiumPreview.mockReturnValue(of(150));
        
        component.selectPolicy(mockPolicies[0] as any);
        
        expect(component.selectedPolicyForApp()).toEqual(mockPolicies[0] as any);
        expect(component.selectedCoverageAmount()).toBe(1000);
        expect(policyAppService.calculatePremiumPreview).toHaveBeenCalled();
        expect(component.calculatedPremium()).toBe(150);
    });

    it('should calculate coverageError correctly', () => {
        component.selectedPolicyForApp.set(mockPolicies[0] as any);
        
        component.selectedCoverageAmount.set(500); // Below min
        expect(component.coverageError()).toContain('at least 1000');
        
        component.selectedCoverageAmount.set(6000); // Above max
        expect(component.coverageError()).toContain('cannot exceed 5000');
        
        component.selectedCoverageAmount.set(2000); // Valid
        expect(component.coverageError()).toBeNull();
    });

    it('should successfully submit application', () => {
        component.businessProfile.set(mockProfile as any);
        component.selectedPolicyForApp.set(mockPolicies[0] as any);
        component.selectedCoverageAmount.set(2000);
        policyAppService.createApplication.mockReturnValue(of({}));
        
        component.submitApplication();
        
        expect(policyAppService.createApplication).toHaveBeenCalled();
        expect(notificationService.show).toHaveBeenCalledWith(expect.stringMatching(/Application submitted/), 'success');
        expect(component.selectedPolicyForApp()).toBeNull(); // Modal closed
    });

    it('should handle submission error', () => {
        component.businessProfile.set(mockProfile as any);
        component.selectedPolicyForApp.set(mockPolicies[0] as any);
        component.selectedCoverageAmount.set(2000);
        policyAppService.createApplication.mockReturnValue(throwError(() => ({ error: { message: 'Failed' } })));
        
        component.submitApplication();
        
        expect(notificationService.show).toHaveBeenCalledWith('Failed', 'error');
    });

    it('should return policy status correctly', () => {
        component.userApplications.set([
            { planId: 1, status: 'APPROVED' }
        ]);
        
        expect(component.getPolicyStatus(1)).toBe('APPROVED');
        expect(component.getPolicyStatus(2)).toBeNull();
        expect(component.getPolicyStatus(undefined)).toBeNull();
    });
});
