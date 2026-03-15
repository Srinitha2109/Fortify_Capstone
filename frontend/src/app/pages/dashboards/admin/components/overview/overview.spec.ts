import 'zone.js';
import 'zone.js/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { OverviewComponent } from './overview';
import { AdminService } from '../../../../../services/admin';
import { PolicyService } from '../../../../../services/policy';
import { Router } from '@angular/router';

describe('Admin OverviewComponent', () => {
    let component: OverviewComponent;
    let fixture: ComponentFixture<OverviewComponent>;
    let adminService: any;
    let policyService: any;
    let router: Router;

    const mockPending = [
        { id: 1, fullName: 'P1' },
        { id: 2, fullName: 'P2' },
        { id: 3, fullName: 'P3' },
        { id: 4, fullName: 'P4' }
    ];
    const mockUsers = [{ id: 1 }, { id: 2 }, { id: 3 }];
    const mockPolicies = [{ id: 1 }, { id: 10 }];

    beforeEach(async () => {
        adminService = {
            getPendingRegistrations: vi.fn(),
            getAllUsers: vi.fn()
        };
        policyService = {
            getAllPolicies: vi.fn()
        };

        await TestBed.configureTestingModule({
            imports: [OverviewComponent, HttpClientTestingModule, RouterTestingModule],
            providers: [
                { provide: AdminService, useValue: adminService },
                { provide: PolicyService, useValue: policyService }
            ]
        }).compileComponents();

        adminService.getPendingRegistrations.mockReturnValue(of(mockPending as any[]));
        adminService.getAllUsers.mockReturnValue(of(mockUsers as any[]));
        policyService.getAllPolicies.mockReturnValue(of(mockPolicies as any[]));

        fixture = TestBed.createComponent(OverviewComponent);
        component = fixture.componentInstance;
        router = TestBed.inject(Router);
    });

    it('should create', () => {
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });

    it('should load stats and recent requests on init', () => {
        fixture.detectChanges();
        
        expect(adminService.getPendingRegistrations).toHaveBeenCalled();
        expect(adminService.getAllUsers).toHaveBeenCalled();
        expect(policyService.getAllPolicies).toHaveBeenCalled();
        
        expect(component.stats().pending).toBe(4);
        expect(component.stats().totalUsers).toBe(3);
        expect(component.stats().totalPolicies).toBe(2);
        expect(component.recentRequests().length).toBe(3);
        expect(component.recentRequests()[0].fullName).toBe('P1');
    });

    it('should navigate to given path', () => {
        vi.spyOn(router, 'navigate');
        component.navigateTo('users');
        expect(router.navigate).toHaveBeenCalledWith(['/admin', 'users']);
    });
});
