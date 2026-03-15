import 'zone.js';
import 'zone.js/testing';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PolicyApplicationService, PolicyApplication, PremiumRequest } from './policy-application';

describe('PolicyApplicationService', () => {
  let service: PolicyApplicationService;
  let httpMock: HttpTestingController;

  const mockApp: PolicyApplication = {
    id: 1,
    userId: 5,
    planId: 2,
    selectedCoverageAmount: 100000,
    status: 'SUBMITTED'
  };

  const mockPremiumReq: PremiumRequest = {
    planId: 2,
    coverageAmount: 100000,
    businessProfileId: 3,
    paymentPlan: 'MONTHLY'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PolicyApplicationService]
    });
    service = TestBed.inject(PolicyApplicationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should createApplication via POST', () => {
    service.createApplication(mockApp).subscribe(app => {
      expect(app.status).toBe('SUBMITTED');
    });
    const req = httpMock.expectOne('/api/policy-applications');
    expect(req.request.method).toBe('POST');
    req.flush(mockApp);
  });

  it('should getAllApplications', () => {
    service.getAllApplications().subscribe(apps => {
      expect(apps.length).toBe(1);
    });
    const req = httpMock.expectOne('/api/policy-applications/all');
    expect(req.request.method).toBe('GET');
    req.flush([mockApp]);
  });

  it('should getApplicationById', () => {
    service.getApplicationById(1).subscribe(app => {
      expect(app.userId).toBe(5);
    });
    const req = httpMock.expectOne('/api/policy-applications/1');
    expect(req.request.method).toBe('GET');
    req.flush(mockApp);
  });

  it('should getApplicationsByUserId', () => {
    service.getApplicationsByUserId(5).subscribe(apps => {
      expect(apps[0].planId).toBe(2);
    });
    const req = httpMock.expectOne('/api/policy-applications/user/5');
    expect(req.request.method).toBe('GET');
    req.flush([mockApp]);
  });

  it('should getApplicationsByAgentId', () => {
    service.getApplicationsByAgentId(3).subscribe(apps => {
      expect(apps.length).toBe(1);
    });
    const req = httpMock.expectOne('/api/policy-applications/agent/3');
    expect(req.request.method).toBe('GET');
    req.flush([mockApp]);
  });

  it('should calculatePremiumPreview via POST', () => {
    service.calculatePremiumPreview(mockPremiumReq).subscribe(premium => {
      expect(premium).toBe(1500);
    });
    const req = httpMock.expectOne('/api/policy-applications/calculate-premium');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockPremiumReq);
    req.flush(1500);
  });

  it('should assignStaff via PUT with query params', () => {
    service.assignStaff(1, 10, 20).subscribe();
    const req = httpMock.expectOne('/api/policy-applications/1/assign-staff?agentId=10&claimOfficerId=20');
    expect(req.request.method).toBe('PUT');
    req.flush(mockApp);
  });

  it('should activatePolicy via PUT', () => {
    service.activatePolicy(1).subscribe(app => {
      expect(app.id).toBe(1);
    });
    const req = httpMock.expectOne('/api/policy-applications/1/activate');
    expect(req.request.method).toBe('PUT');
    req.flush({ ...mockApp, status: 'ACTIVE' });
  });

  it('should approveApplication via PUT', () => {
    service.approveApplication(1).subscribe(app => {
      expect(app.status).toBe('APPROVED');
    });
    const req = httpMock.expectOne('/api/policy-applications/1/approve');
    expect(req.request.method).toBe('PUT');
    req.flush({ ...mockApp, status: 'APPROVED' });
  });

  it('should rejectApplication via PUT with reason', () => {
    service.rejectApplication(1, 'Incomplete info').subscribe();
    const req = httpMock.expectOne('/api/policy-applications/1/reject?reason=Incomplete info');
    expect(req.request.method).toBe('PUT');
    req.flush({ ...mockApp, status: 'REJECTED' });
  });
});
