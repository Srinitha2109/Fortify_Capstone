import 'zone.js';
import 'zone.js/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { ClaimsComponent } from './claims';
import { ClaimService } from '../../../../services/claim';
import { AuthService } from '../../../../services/auth';

describe('Policyholder ClaimsComponent', () => {
    let component: ClaimsComponent;
    let fixture: ComponentFixture<ClaimsComponent>;
    let claimService: any;
    let authService: any;

    const mockClaims = [
        { id: 1, claimNumber: 'CLM-001', status: 'SUBMITTED', claimAmount: 1000 },
        { id: 2, claimNumber: 'CLM-002', status: 'APPROVED', claimAmount: 2000 }
    ];

    const mockUser = { id: 1, email: 'test@example.com' };

    beforeEach(async () => {
        claimService = { getClaimsByUserId: vi.fn() };
        authService = { currentUser: vi.fn() };

        await TestBed.configureTestingModule({
            imports: [ClaimsComponent, HttpClientTestingModule],
            providers: [
                { provide: ClaimService, useValue: claimService },
                { provide: AuthService, useValue: authService }
            ]
        }).compileComponents();

        authService.currentUser.mockReturnValue(mockUser);
        claimService.getClaimsByUserId.mockReturnValue(of(mockClaims as any[]));

        fixture = TestBed.createComponent(ClaimsComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });

    it('should load claims for the current user on init', () => {
        fixture.detectChanges();
        expect(authService.currentUser).toHaveBeenCalled();
        expect(claimService.getClaimsByUserId).toHaveBeenCalledWith(1);
        expect(component.claims()).toEqual(mockClaims as any[]);
        expect(component.isLoading()).toBe(false);
    });

    it('should handle loading error', () => {
        claimService.getClaimsByUserId.mockReturnValue(throwError(() => new Error('Error')));
        fixture.detectChanges();
        expect(component.isLoading()).toBe(false);
        expect(component.claims().length).toBe(0);
    });

    it('should return correct status classes', () => {
        expect(component.getStatusClass('SUBMITTED')).toContain('bg-burgundy/5');
        expect(component.getStatusClass('APPROVED')).toContain('bg-pink/10');
        expect(component.getStatusClass('REJECTED')).toContain('bg-rose-50');
        expect(component.getStatusClass('SETTLED')).toContain('bg-burgundy');
        expect(component.getStatusClass('UNKNOWN')).toContain('bg-slate-100');
    });

    it('should not load claims if user is not logged in', () => {
        authService.currentUser.mockReturnValue(null);
        fixture.detectChanges();
        expect(claimService.getClaimsByUserId).not.toHaveBeenCalled();
    });
});
