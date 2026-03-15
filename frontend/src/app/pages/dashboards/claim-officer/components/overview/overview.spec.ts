import 'zone.js';
import 'zone.js/testing';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { vi } from 'vitest';
import { OverviewComponent } from './overview';
import { AuthService } from '../../../../../services/auth';
import { Router } from '@angular/router';

describe('ClaimOfficer OverviewComponent', () => {
    let component: OverviewComponent;
    let fixture: ComponentFixture<OverviewComponent>;
    let authService: any;
    let httpMock: HttpTestingController;
    let router: Router;

    const mockUser = { id: 10, fullName: 'Officer 1' };
    const mockOfficer = { id: 5, userId: 10 };
    const mockClaims = [
        { id: 1, status: 'SUBMITTED', claimAmount: 1000, incidentDate: '2025-01-01' },
        { id: 2, status: 'APPROVED', claimAmount: 2000, incidentDate: '2025-02-01' },
        { id: 3, status: 'REJECTED', claimAmount: 500, incidentDate: '2025-03-01' }
    ];

    beforeEach(async () => {
        authService = {
            currentUser: vi.fn()
        };

        await TestBed.configureTestingModule({
            imports: [OverviewComponent, HttpClientTestingModule, RouterTestingModule],
            providers: [
                { provide: AuthService, useValue: authService }
            ]
        }).compileComponents();

        httpMock = TestBed.inject(HttpTestingController);
        authService.currentUser.mockReturnValue(mockUser);
        router = TestBed.inject(Router);

        fixture = TestBed.createComponent(OverviewComponent);
        component = fixture.componentInstance;
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should create', () => {
        fixture.detectChanges();
        httpMock.expectOne('/api/claim-officers/by-user/10').flush(mockOfficer);
        httpMock.expectOne('/api/claims/claim-officer/5').flush(mockClaims);
        expect(component).toBeTruthy();
    });

    it('should load officer and claims on init and calculate stats', () => {
        fixture.detectChanges();
        
        httpMock.expectOne('/api/claim-officers/by-user/10').flush(mockOfficer);
        httpMock.expectOne('/api/claims/claim-officer/5').flush(mockClaims);
        
        expect(component.pendingCount()).toBe(1); // SUBMITTED
        expect(component.approvedCount()).toBe(1); // APPROVED
        expect(component.totalPayouts()).toBe(2000); // Only APPROVED
        expect(component.allClaims().length).toBe(3);
        expect(component.allClaims()[0].id).toBe(3); // Newest first
    });

    it('should handle openDocument with documents', fakeAsync(() => {
        const mockDocs = [{ id: 101, fileName: 'test.pdf' }];
        const mockBlob = new Blob([''], { type: 'application/pdf' });
        vi.spyOn(window, 'open');
        vi.spyOn(window.URL, 'createObjectURL').mockReturnValue('blob:url');
        
        component.openDocument(1);
        
        httpMock.expectOne('/api/claim-documents/claim/1').flush(mockDocs);
        httpMock.expectOne('/api/documents/101').flush(mockBlob);
        
        expect(window.open).toHaveBeenCalledWith('blob:url', '_blank');
        tick(10000); // For revokeObjectURL
    }));

    it('should handle openDocument with no documents', () => {
        vi.spyOn(window, 'alert').mockImplementation(() => {});
        component.openDocument(1);
        
        httpMock.expectOne('/api/claim-documents/claim/1').flush([]);
        expect(window.alert).toHaveBeenCalledWith(expect.stringMatching(/No documents found/));
    });

    it('should navigate to requests on inspect', () => {
        vi.spyOn(router, 'navigate');
        component.inspectClaim(1);
        expect(router.navigate).toHaveBeenCalledWith(['/claim-officer/requests']);
    });

    it('should return correct status classes', () => {
        expect(component.getStatusClass('APPROVED')).toContain('text-emerald-600');
        expect(component.getStatusClass('SETTLED')).toContain('text-emerald-600');
        expect(component.getStatusClass('REJECTED')).toContain('text-rose-500');
        expect(component.getStatusClass('PENDING')).toContain('text-amber-600');
    });

    it('should handle API errors gracefully', () => {
        fixture.detectChanges();
        httpMock.expectOne('/api/claim-officers/by-user/10').error(new ErrorEvent('Error'));
        expect(component.isLoading()).toBe(false);
    });
});
