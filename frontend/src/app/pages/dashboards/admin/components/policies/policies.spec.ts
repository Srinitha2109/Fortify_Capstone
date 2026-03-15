import 'zone.js';
import 'zone.js/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { PoliciesComponent } from './policies';
import { PolicyService } from '../../../../../services/policy';
import { NotificationService } from '../../../../../services/notification';

describe('Admin PoliciesComponent', () => {
    let component: PoliciesComponent;
    let fixture: ComponentFixture<PoliciesComponent>;
    let policyService: any;
    let notificationService: any;

    const mockPolicies = [
        { id: 1, policyNumber: 'P1', policyName: 'Health A', insuranceType: 'HEALTH', isActive: true },
        { id: 2, policyNumber: 'P2', policyName: 'Life B', insuranceType: 'LIFE', isActive: false }
    ];

    beforeEach(async () => {
        policyService = {
            getAllPolicies: vi.fn(),
            createPolicy: vi.fn(),
            updatePolicy: vi.fn()
        };
        notificationService = {
            show: vi.fn()
        };

        await TestBed.configureTestingModule({
            imports: [PoliciesComponent, HttpClientTestingModule],
            providers: [
                { provide: PolicyService, useValue: policyService },
                { provide: NotificationService, useValue: notificationService }
            ]
        }).compileComponents();

        policyService.getAllPolicies.mockReturnValue(of(mockPolicies as any[]));

        fixture = TestBed.createComponent(PoliciesComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });

    it('should load policies on init', () => {
        fixture.detectChanges();
        expect(policyService.getAllPolicies).toHaveBeenCalled();
        expect(component.policies()).toEqual(mockPolicies as any[]);
    });

    it('should filter policies by search query', () => {
        fixture.detectChanges();
        component.searchQuery.set('Health');
        expect(component.filteredPolicies().length).toBe(1);
        expect(component.filteredPolicies()[0].policyName).toBe('Health A');
    });

    it('should filter policies by status', () => {
        fixture.detectChanges();
        component.filterStatus.set('inactive');
        expect(component.filteredPolicies().length).toBe(1);
        expect(component.filteredPolicies()[0].isActive).toBe(false);
    });

    it('should filter policies by type', () => {
        fixture.detectChanges();
        component.filterType.set('LIFE');
        expect(component.filteredPolicies().length).toBe(1);
        expect(component.filteredPolicies()[0].insuranceType).toBe('LIFE');
    });

    it('should open create form and reset data', () => {
        component.openCreateForm();
        expect(component.isEditMode()).toBe(false);
        expect(component.showPolicyForm()).toBe(true);
        expect(component.currentPolicy().policyName).toBe('');
    });

    it('should open edit form with policy data', () => {
        const policy = mockPolicies[0] as any;
        component.openEditForm(policy);
        expect(component.isEditMode()).toBe(true);
        expect(component.showPolicyForm()).toBe(true);
        expect(component.currentPolicy().id).toBe(1);
    });

    it('should validate form fields on save', () => {
        component.currentPolicy.set({ policyName: '' });
        component.savePolicy();
        expect(component.formSubmitted()).toBe(true);
        expect(notificationService.show).toHaveBeenCalledWith(expect.any(String), 'warning');
    });

    it('should call createPolicy on save when not in edit mode', () => {
        component.isEditMode.set(false);
        component.currentPolicy.set({ policyName: 'New', insuranceType: 'LIFE', durationMonths: 12, basePremium: 100 });
        policyService.createPolicy.mockReturnValue(of({}));
        
        component.savePolicy();
        
        expect(policyService.createPolicy).toHaveBeenCalled();
        expect(notificationService.show).toHaveBeenCalledWith(expect.stringMatching(/created successfully/), 'success');
        expect(component.showPolicyForm()).toBe(false);
    });

    it('should call updatePolicy on save when in edit mode', () => {
        component.isEditMode.set(true);
        component.currentPolicy.set({ id: 1, policyName: 'Updated', insuranceType: 'HEALTH', durationMonths: 12, basePremium: 150 });
        policyService.updatePolicy.mockReturnValue(of({}));
        
        component.savePolicy();
        
        expect(policyService.updatePolicy).toHaveBeenCalled();
        expect(notificationService.show).toHaveBeenCalledWith(expect.stringMatching(/updated successfully/), 'success');
    });

    it('should handle save/update error', () => {
        component.isEditMode.set(false);
        component.currentPolicy.set({ policyName: 'New', insuranceType: 'LIFE', durationMonths: 12, basePremium: 100 });
        policyService.createPolicy.mockReturnValue(throwError(() => new Error('Error')));
        
        component.savePolicy();
        
        expect(notificationService.show).toHaveBeenCalledWith(expect.stringMatching(/Failed to create/), 'error');
    });
});
