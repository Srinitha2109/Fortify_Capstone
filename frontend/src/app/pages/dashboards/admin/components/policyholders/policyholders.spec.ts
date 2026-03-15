import 'zone.js';
import 'zone.js/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { PolicyholdersComponent } from './policyholders';
import { AdminService } from '../../../../../services/admin';
import { NotificationService } from '../../../../../services/notification';

describe('Admin PolicyholdersComponent', () => {
    let component: PolicyholdersComponent;
    let fixture: ComponentFixture<PolicyholdersComponent>;
    let adminService: any;
    let notificationService: any;

    const mockProfiles = [
        { id: 1, businessName: 'Biz 1', industry: 'TECH' },
        { id: 2, businessName: 'Biz 2', industry: 'RETAIL' }
    ];
    const mockAgents = [{ id: 101, fullName: 'Agent A' }];
    const mockOfficers = [{ id: 201, fullName: 'Officer O' }];

    beforeEach(async () => {
        adminService = {
            getAllBusinessProfiles: vi.fn(),
            getAllAgents: vi.fn(),
            getAllClaimOfficers: vi.fn(),
            getAvailableAgentsBySpecialization: vi.fn(),
            getAvailableClaimOfficersBySpecialization: vi.fn(),
            assignStaffToProfile: vi.fn()
        };
        notificationService = {
            show: vi.fn()
        };

        await TestBed.configureTestingModule({
            imports: [PolicyholdersComponent, HttpClientTestingModule],
            providers: [
                { provide: AdminService, useValue: adminService },
                { provide: NotificationService, useValue: notificationService }
            ]
        }).compileComponents();

        adminService.getAllBusinessProfiles.mockReturnValue(of(mockProfiles as any[]));
        adminService.getAllAgents.mockReturnValue(of(mockAgents as any[]));
        adminService.getAllClaimOfficers.mockReturnValue(of(mockOfficers as any[]));

        fixture = TestBed.createComponent(PolicyholdersComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });

    it('should load all data on init', () => {
        fixture.detectChanges();
        expect(adminService.getAllBusinessProfiles).toHaveBeenCalled();
        expect(adminService.getAllAgents).toHaveBeenCalled();
        expect(adminService.getAllClaimOfficers).toHaveBeenCalled();
        
        expect(component.businessProfiles().length).toBe(2);
        expect(component.agents().length).toBe(1);
        expect(component.claimOfficers().length).toBe(1);
    });

    it('should open assignment modal and set specialization', () => {
        const profile = mockProfiles[0] as any;
        component.openProfileAssignModal(profile);
        
        expect(component.selectedProfile()).toEqual(profile);
        expect(component.selectedSpecialization()).toBe('TECH');
        expect(component.assignmentStep()).toBe(1);
        expect(component.showProfileAssignment()).toBe(true);
    });

    it('should fetch filtered staff when going to selection step', () => {
        component.selectedSpecialization.set('TECH');
        adminService.getAvailableAgentsBySpecialization.mockReturnValue(of(mockAgents as any[]));
        adminService.getAvailableClaimOfficersBySpecialization.mockReturnValue(of(mockOfficers as any[]));
        
        component.goToSelectionStep();
        
        expect(adminService.getAvailableAgentsBySpecialization).toHaveBeenCalledWith('TECH');
        expect(adminService.getAvailableClaimOfficersBySpecialization).toHaveBeenCalledWith('TECH');
        expect(component.filteredAgents()).toEqual(mockAgents as any[]);
        expect(component.filteredClaimOfficers()).toEqual(mockOfficers as any[]);
        expect(component.assignmentStep()).toBe(2);
    });

    it('should show warning if agent or officer is not selected on assignment', () => {
        component.selectedProfile.set(mockProfiles[0] as any);
        component.profileSelectedAgentId.set(null);
        
        component.assignStaffToProfile();
        expect(notificationService.show).toHaveBeenCalledWith(expect.any(String), 'warning');
    });

    it('should successfully assign staff to profile', () => {
        component.selectedProfile.set(mockProfiles[0] as any);
        component.profileSelectedAgentId.set(101);
        component.profileSelectedClaimOfficerId.set(201);
        adminService.assignStaffToProfile.mockReturnValue(of({}));
        
        component.assignStaffToProfile();
        
        expect(adminService.assignStaffToProfile).toHaveBeenCalledWith(1, 101, 201);
        expect(notificationService.show).toHaveBeenCalledWith(expect.stringMatching(/assigned successfully/), 'success');
        expect(component.showProfileAssignment()).toBe(false);
        expect(adminService.getAllBusinessProfiles).toHaveBeenCalled(); // Data reloaded
    });

    it('should handle assignment error', () => {
        component.selectedProfile.set(mockProfiles[0] as any);
        component.profileSelectedAgentId.set(101);
        component.profileSelectedClaimOfficerId.set(201);
        adminService.assignStaffToProfile.mockReturnValue(throwError(() => new Error('Error')));
        
        component.assignStaffToProfile();
        expect(notificationService.show).toHaveBeenCalledWith(expect.stringMatching(/Failed to assign/), 'error');
    });
});
