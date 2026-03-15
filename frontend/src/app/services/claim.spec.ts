import 'zone.js';
import 'zone.js/testing';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ClaimService, Claim } from './claim';

describe('ClaimService', () => {
  let service: ClaimService;
  let httpMock: HttpTestingController;

  const mockClaim: Claim = {
    id: 1,
    claimNumber: 'CLM-0001',
    policyApplicationId: 10,
    policyNumber: 'POL-001',
    description: 'Fire damage claim',
    claimAmount: 50000,
    incidentDate: '2025-01-15',
    incidentLocation: 'Warehouse A',
    status: 'SUBMITTED',
    claimOfficerId: 5
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ClaimService]
    });
    service = TestBed.inject(ClaimService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should createClaim via POST with form data', () => {
    const formClaim: Claim = {
      policyApplicationId: 10,
      description: 'Water damage',
      claimAmount: 20000,
      incidentDate: '2025-02-10',
      incidentLocation: 'Office Block B'
    };

    service.createClaim(formClaim).subscribe(claim => {
      expect(claim.claimNumber).toBe('CLM-0001');
      expect(claim.status).toBe('SUBMITTED');
    });

    const req = httpMock.expectOne('/api/claims');
    expect(req.request.method).toBe('POST');
    req.flush(mockClaim);
  });

  it('should createClaim with documents attached', () => {
    const file = new File(['content'], 'damage-report.pdf', { type: 'application/pdf' });
    const claimData: Claim = {
      policyApplicationId: 10,
      description: 'Flood damage',
      claimAmount: 30000,
      incidentDate: '2025-03-01',
      incidentLocation: 'Ground Floor'
    };

    service.createClaim(claimData, [file]).subscribe();

    const req = httpMock.expectOne('/api/claims');
    expect(req.request.method).toBe('POST');
    expect(req.request.body instanceof FormData).toBe(true);
    req.flush(mockClaim);
  });

  it('should getClaimsByApplication for policyApplicationId', () => {
    service.getClaimsByApplication(10).subscribe(claims => {
      expect(claims.length).toBe(1);
      expect(claims[0].policyNumber).toBe('POL-001');
    });

    const req = httpMock.expectOne('/api/claims/policy-application/10');
    expect(req.request.method).toBe('GET');
    req.flush([mockClaim]);
  });

  it('should getClaimById for specific claim', () => {
    service.getClaimById(1).subscribe(claim => {
      expect(claim.claimNumber).toBe('CLM-0001');
      expect(claim.claimAmount).toBe(50000);
      expect(claim.status).toBe('SUBMITTED');
    });

    const req = httpMock.expectOne('/api/claims/1');
    expect(req.request.method).toBe('GET');
    req.flush(mockClaim);
  });

  it('should getClaimsByUserId for all claims of a user', () => {
    service.getClaimsByUserId(5).subscribe(claims => {
      expect(claims.length).toBe(2);
      expect(claims[0].claimNumber).toBe('CLM-0001');
    });

    const req = httpMock.expectOne('/api/claims/user/5');
    expect(req.request.method).toBe('GET');
    req.flush([mockClaim, { ...mockClaim, id: 2, claimNumber: 'CLM-0002' }]);
  });

  it('should return empty array when user has no claims', () => {
    service.getClaimsByUserId(99).subscribe(claims => {
      expect(claims.length).toBe(0);
    });

    const req = httpMock.expectOne('/api/claims/user/99');
    req.flush([]);
  });
});
