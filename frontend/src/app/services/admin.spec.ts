import 'zone.js';
import 'zone.js/testing';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AdminService, UserRequest, Agent, ClaimOfficer, BusinessProfile } from './admin';

describe('AdminService', () => {
  let service: AdminService;
  let httpMock: HttpTestingController;

  const mockRequests: UserRequest[] = [
    { id: 1, fullName: 'Alice', email: 'alice@gmail.com', phone: '111', role: 'POLICYHOLDER', status: 'PENDING' },
    { id: 2, fullName: 'Bob', email: 'bob@gmail.com', phone: '222', role: 'AGENT', status: 'PENDING' }
  ];

  const mockAgents: Agent[] = [
    { id: 1, userId: 10, fullName: 'Agent One', agentCode: 'A001', licenseNumber: 'L001', specialization: 'TECHNOLOGY', commissionRate: 5 }
  ];

  const mockOfficers: ClaimOfficer[] = [
    { id: 1, region: 'NORTH', user: { id: 20, fullName: 'Officer A', email: 'oa@gmail.com' } }
  ];

  const mockProfiles: BusinessProfile[] = [
    { id: 1, userId: 5, userFullName: 'Carol', businessName: 'BizA', industry: 'TECHNOLOGY', annualRevenue: 100000, employeeCount: 10, city: 'NY', isProfileCompleted: true }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AdminService]
    });
    service = TestBed.inject(AdminService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should getPendingRegistrations and update signal', () => {
    service.getPendingRegistrations().subscribe(data => {
      expect(data).toEqual(mockRequests);
      expect(service.pendingRequests()).toEqual(mockRequests);
    });
    const req = httpMock.expectOne('/api/admin/registration-requests');
    expect(req.request.method).toBe('GET');
    req.flush(mockRequests);
  });

  it('should approveRegistration by id', () => {
    service.approveRegistration(1).subscribe(data => {
      expect(data.status).toBe('APPROVED');
    });
    const req = httpMock.expectOne('/api/admin/registration-requests/1/approve');
    expect(req.request.method).toBe('PATCH');
    req.flush({ ...mockRequests[0], status: 'APPROVED' });
  });

  it('should rejectRegistration by id with remarks', () => {
    service.rejectRegistration(2, 'Invalid info').subscribe();
    const req = httpMock.expectOne('/api/admin/registration-requests/2/reject');
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toBe('Invalid info');
    req.flush({ ...mockRequests[1], status: 'REJECTED' });
  });

  it('should getAllUsers', () => {
    service.getAllUsers().subscribe(data => {
      expect(data.length).toBe(2);
    });
    const req = httpMock.expectOne('/api/admin/users');
    expect(req.request.method).toBe('GET');
    req.flush(mockRequests);
  });

  it('should getAllAgents', () => {
    service.getAllAgents().subscribe(data => {
      expect(data).toEqual(mockAgents);
    });
    const req = httpMock.expectOne('/api/agents');
    expect(req.request.method).toBe('GET');
    req.flush(mockAgents);
  });

  it('should getAvailableAgentsBySpecialization', () => {
    service.getAvailableAgentsBySpecialization('TECHNOLOGY').subscribe(data => {
      expect(data).toEqual(mockAgents);
    });
    const req = httpMock.expectOne('/api/agents/available?specialization=TECHNOLOGY');
    expect(req.request.method).toBe('GET');
    req.flush(mockAgents);
  });

  it('should getAvailableClaimOfficersBySpecialization', () => {
    service.getAvailableClaimOfficersBySpecialization('TECHNOLOGY').subscribe(data => {
      expect(data).toEqual(mockOfficers);
    });
    const req = httpMock.expectOne('/api/claim-officers/available/TECHNOLOGY');
    expect(req.request.method).toBe('GET');
    req.flush(mockOfficers);
  });

  it('should getAllClaimOfficers', () => {
    service.getAllClaimOfficers().subscribe(data => {
      expect(data).toEqual(mockOfficers);
    });
    const req = httpMock.expectOne('/api/claim-officers');
    expect(req.request.method).toBe('GET');
    req.flush(mockOfficers);
  });

  it('should getAllBusinessProfiles', () => {
    service.getAllBusinessProfiles().subscribe(data => {
      expect(data).toEqual(mockProfiles);
    });
    const req = httpMock.expectOne('/api/business-profiles');
    expect(req.request.method).toBe('GET');
    req.flush(mockProfiles);
  });

  it('should assignStaffToProfile with correct URL params', () => {
    service.assignStaffToProfile(1, 10, 20).subscribe();
    const req = httpMock.expectOne('/api/business-profiles/1/assign-staff?agentId=10&claimOfficerId=20');
    expect(req.request.method).toBe('PUT');
    req.flush(mockProfiles[0]);
  });
});
