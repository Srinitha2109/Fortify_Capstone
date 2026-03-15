import 'zone.js';
import 'zone.js/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { RequestsComponent } from './requests';
import { AdminService } from '../../../../../services/admin';
import { NotificationService } from '../../../../../services/notification';

describe('Admin RequestsComponent', () => {
    let component: RequestsComponent;
    let fixture: ComponentFixture<RequestsComponent>;
    let adminService: any;
    let notificationService: any;

    const mockRequests = [
        { id: 1, fullName: 'John Pending', email: 'john@test.com', role: 'POLICYHOLDER' },
        { id: 2, fullName: 'Jane Pending', email: 'jane@test.com', role: 'AGENT' }
    ];

    beforeEach(async () => {
        adminService = {
            getPendingRegistrations: vi.fn(),
            approveRegistration: vi.fn(),
            rejectRegistration: vi.fn()
        };
        notificationService = {
            show: vi.fn()
        };

        await TestBed.configureTestingModule({
            imports: [RequestsComponent, HttpClientTestingModule],
            providers: [
                { provide: AdminService, useValue: adminService },
                { provide: NotificationService, useValue: notificationService }
            ]
        }).compileComponents();

        adminService.getPendingRegistrations.mockReturnValue(of(mockRequests as any[]));

        fixture = TestBed.createComponent(RequestsComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });

    it('should load pending registration requests on init', () => {
        fixture.detectChanges();
        expect(adminService.getPendingRegistrations).toHaveBeenCalled();
        expect(component.requests()).toEqual(mockRequests as any[]);
    });

    it('should approve registration and reload', () => {
        adminService.approveRegistration.mockReturnValue(of({}));
        adminService.getPendingRegistrations.mockReturnValue(of([]));
        
        component.approve(1);
        
        expect(adminService.approveRegistration).toHaveBeenCalledWith(1);
        expect(notificationService.show).toHaveBeenCalledWith(expect.stringMatching(/approved/), 'success');
        expect(adminService.getPendingRegistrations).toHaveBeenCalled();
    });

    it('should handle approval error', () => {
        adminService.approveRegistration.mockReturnValue(throwError(() => new Error('Error')));
        
        component.approve(1);
        
        expect(notificationService.show).toHaveBeenCalledWith(expect.stringMatching(/Failed to approve/), 'error');
    });

    it('should reject registration if remarks are provided', () => {
        vi.spyOn(window, 'prompt').mockReturnValue('Reason for rejection');
        adminService.rejectRegistration.mockReturnValue(of({}));
        adminService.getPendingRegistrations.mockReturnValue(of([]));
        
        component.reject(1);
        
        expect(window.prompt).toHaveBeenCalled();
        expect(adminService.rejectRegistration).toHaveBeenCalledWith(1, 'Reason for rejection');
        expect(notificationService.show).toHaveBeenCalledWith(expect.stringMatching(/rejected/), 'info');
    });

    it('should not reject registration if prompt is cancelled', () => {
        vi.spyOn(window, 'prompt').mockReturnValue(null);
        
        component.reject(1);
        
        expect(adminService.rejectRegistration).not.toHaveBeenCalled();
    });

    it('should handle rejection error', () => {
        vi.spyOn(window, 'prompt').mockReturnValue('Reason');
        adminService.rejectRegistration.mockReturnValue(throwError(() => new Error('Error')));
        
        component.reject(1);
        
        expect(notificationService.show).toHaveBeenCalledWith(expect.stringMatching(/Failed to reject/), 'error');
    });
});
