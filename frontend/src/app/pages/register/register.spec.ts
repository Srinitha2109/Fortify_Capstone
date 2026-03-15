import 'zone.js';
import 'zone.js/testing';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { vi } from 'vitest';
import { RegisterComponent } from './register';
import { AuthService } from '../../services/auth';
import { NotificationService } from '../../services/notification';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

describe('RegisterComponent', () => {
    let component: RegisterComponent;
    let fixture: ComponentFixture<RegisterComponent>;
    let authService: any;
    let notificationService: any;
    let router: Router;

    beforeEach(async () => {
        authService = { register: vi.fn() };
        notificationService = { show: vi.fn() };

        await TestBed.configureTestingModule({
            imports: [RegisterComponent, HttpClientTestingModule, RouterTestingModule, ReactiveFormsModule],
            providers: [
                { provide: AuthService, useValue: authService },
                { provide: NotificationService, useValue: notificationService }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(RegisterComponent);
        component = fixture.componentInstance;
        router = TestBed.inject(Router);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have role set to POLICYHOLDER initially and correctly set validators', () => {
        expect(component.role).toBe('POLICYHOLDER');
        const bizName = component.registerForm.get('businessName');
        expect(bizName?.validator).toBeDefined();
        
        const territory = component.registerForm.get('territory');
        expect(territory?.validator).toBeNull();
    });

    it('should update validators when role changes to AGENT', () => {
        component.registerForm.get('role')?.setValue('AGENT');
        
        expect(component.registerForm.get('businessName')?.validator).toBeNull();
        expect(component.registerForm.get('experience')?.validator).toBeDefined();
        expect(component.registerForm.get('territory')?.validator).toBeDefined();
    });

    it('should update validators when role changes to CLAIM_OFFICER', () => {
        component.registerForm.get('role')?.setValue('CLAIM_OFFICER');
        
        expect(component.registerForm.get('businessName')?.validator).toBeNull();
        expect(component.registerForm.get('experience')?.validator).toBeDefined();
        expect(component.registerForm.get('region')?.validator).toBeDefined();
    });

    it('should validate gmail.com pattern for email', () => {
        const email = component.registerForm.get('email');
        
        email?.setValue('test@outlook.com');
        expect(email?.hasError('pattern')).toBe(true);
        
        email?.setValue('test@gmail.com');
        expect(email?.hasError('pattern')).toBe(false);
    });

    it('should call authService.register and navigate on success', () => {
        authService.register.mockReturnValue(of({}));
        vi.spyOn(router, 'navigate');
        
        // Fill minimum required fields for POLICYHOLDER
        component.registerForm.patchValue({
            fullName: 'John Doe',
            email: 'john@gmail.com',
            phone: '1234567890',
            businessName: 'John Biz',
            industry: 'TECH',
            annualRevenue: '1M',
            employeeCount: '10',
            city: 'New York'
        });
        
        component.onRegister();
        
        expect(authService.register).toHaveBeenCalled();
        expect(notificationService.show).toHaveBeenCalledWith(expect.stringMatching(/Request received/), 'success');
        expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should handle registration error', () => {
        authService.register.mockReturnValue(throwError(() => new Error('Failed')));
        
        component.registerForm.patchValue({
            fullName: 'John Doe',
            email: 'john@gmail.com',
            phone: '1234567890',
            businessName: 'John Biz',
            industry: 'TECH',
            annualRevenue: '1M',
            employeeCount: '10',
            city: 'New York'
        });
        
        component.onRegister();
        
        expect(notificationService.show).toHaveBeenCalledWith(expect.stringMatching(/Submission failed/), 'error');
    });

    it('should mark form as submitted and show error on invalid submission', () => {
        component.onRegister();
        
        expect(component.registerForm.get('formSubmitted')?.value).toBe(true);
        expect(notificationService.show).toHaveBeenCalledWith(expect.stringMatching(/fill all required fields/), 'error');
    });
});
