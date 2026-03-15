import 'zone.js';
import 'zone.js/testing';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { vi } from 'vitest';
import { LoginComponent } from './login';
import { AuthService } from '../../services/auth';
import { NotificationService } from '../../services/notification';

describe('LoginComponent', () => {
    let component: LoginComponent;
    let fixture: ComponentFixture<LoginComponent>;
    let authService: any;
    let notificationService: any;

    beforeEach(async () => {
        authService = {
            login: vi.fn()
        };
        notificationService = {
            show: vi.fn()
        };

        await TestBed.configureTestingModule({
            imports: [LoginComponent, HttpClientTestingModule, RouterTestingModule, ReactiveFormsModule],
            providers: [
                { provide: AuthService, useValue: authService },
                { provide: NotificationService, useValue: notificationService }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(LoginComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should be invalid initially', () => {
        expect(component.loginForm.valid).toBe(false);
    });

    it('should validate email format', () => {
        const email = component.loginForm.get('email');
        email?.setValue('invalid-email');
        expect(email?.hasError('email')).toBe(true);
        email?.setValue('valid@test.com');
        expect(email?.hasError('email')).toBe(false);
    });

    it('should toggle password visibility', () => {
        expect(component.showPassword).toBe(false);
        component.togglePassword();
        expect(component.showPassword).toBe(true);
    });

    it('should handle recaptcha simulation', fakeAsync(() => {
        component.handleRecaptcha();
        expect(component.isRecaptchaLoading).toBe(true);
        tick(1000);
        expect(component.isRecaptchaLoading).toBe(false);
        expect(component.loginForm.get('recaptcha')?.value).toBe(true);
    }));

    it('should call authService.login when form is valid', () => {
        component.loginForm.patchValue({
            email: 'user@test.com',
            password: 'password123',
            role: 'POLICYHOLDER',
            recaptcha: true
        });
        
        component.onLogin();
        expect(authService.login).toHaveBeenCalled();
    });

    it('should show error and mark touched when form is invalid', () => {
        component.loginForm.patchValue({ email: 'invalid' });
        component.onLogin();
        
        expect(authService.login).not.toHaveBeenCalled();
        expect(notificationService.show).toHaveBeenCalledWith(expect.any(String), 'error');
        expect(component.loginForm.touched).toBe(true);
    });

    it('should have all roles listed', () => {
        expect(component.roles.length).toBe(4);
        expect(component.roles.find(r => r.value === 'ADMIN')).toBeDefined();
        expect(component.roles.find(r => r.value === 'POLICYHOLDER')).toBeDefined();
    });
});
