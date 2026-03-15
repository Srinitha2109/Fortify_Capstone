import 'zone.js';
import 'zone.js/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { UsersComponent } from './users';
import { AdminService } from '../../../../../services/admin';
import { NotificationService } from '../../../../../services/notification';

describe('Admin UsersComponent', () => {
    let component: UsersComponent;
    let fixture: ComponentFixture<UsersComponent>;
    let adminService: any;
    let notificationService: any;

    const mockUsers = [
        { id: 1, fullName: 'User 1', role: 'ADMIN', status: 'ACTIVE' },
        { id: 2, fullName: 'User 2', role: 'POLICYHOLDER', status: 'ACTIVE' },
        { id: 3, fullName: 'User 3', role: 'AGENT', status: 'ACTIVE' }
    ];

    beforeEach(async () => {
        adminService = {
            getAllUsers: vi.fn()
        };
        notificationService = {
            show: vi.fn()
        };

        await TestBed.configureTestingModule({
            imports: [UsersComponent, HttpClientTestingModule],
            providers: [
                { provide: AdminService, useValue: adminService },
                { provide: NotificationService, useValue: notificationService }
            ]
        }).compileComponents();

        adminService.getAllUsers.mockReturnValue(of(mockUsers as any[]));

        fixture = TestBed.createComponent(UsersComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });

    it('should load users and show all on init', () => {
        fixture.detectChanges();
        expect(adminService.getAllUsers).toHaveBeenCalled();
        expect(component.users()).toEqual(mockUsers as any[]);
        expect(component.filteredUsers().length).toBe(3);
        expect(component.selectedRole()).toBe('ALL');
    });

    it('should filter users by role', () => {
        fixture.detectChanges();
        
        const event = { target: { value: 'ADMIN' } } as any;
        component.onRoleChange(event);
        
        expect(component.selectedRole()).toBe('ADMIN');
        expect(component.filteredUsers().length).toBe(1);
        expect(component.filteredUsers()[0].fullName).toBe('User 1');
    });

    it('should filter users by POLICYHOLDER role', () => {
        fixture.detectChanges();
        
        const event = { target: { value: 'POLICYHOLDER' } } as any;
        component.onRoleChange(event);
        
        expect(component.filteredUsers().length).toBe(1);
        expect(component.filteredUsers()[0].fullName).toBe('User 2');
    });

    it('should reset to all users when ALL is selected', () => {
        fixture.detectChanges();
        
        component.selectedRole.set('ADMIN');
        component.applyFilter();
        expect(component.filteredUsers().length).toBe(1);
        
        component.selectedRole.set('ALL');
        component.applyFilter();
        expect(component.filteredUsers().length).toBe(3);
    });

    it('should show error notification when user loading fails', () => {
        adminService.getAllUsers.mockReturnValue(throwError(() => new Error('Error')));
        fixture.detectChanges();
        
        expect(notificationService.show).toHaveBeenCalledWith(expect.stringMatching(/Failed to load system users/), 'error');
    });
});
