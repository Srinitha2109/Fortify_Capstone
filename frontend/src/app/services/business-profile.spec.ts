import 'zone.js';
import 'zone.js/testing';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { BusinessProfileService, BusinessProfile } from './business-profile';

describe('BusinessProfileService', () => {
  let service: BusinessProfileService;
  let httpMock: HttpTestingController;

  const mockProfile: BusinessProfile = {
    id: 1,
    userId: 5,
    businessName: 'TechCorp',
    industry: 'TECHNOLOGY',
    annualRevenue: 500000,
    employeeCount: 50,
    city: 'Bangalore',
    isProfileCompleted: true,
    agentId: 10,
    claimOfficerId: 20
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [BusinessProfileService]
    });
    service = TestBed.inject(BusinessProfileService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should createProfile via POST', () => {
    service.createProfile(mockProfile).subscribe(profile => {
      expect(profile.businessName).toBe('TechCorp');
    });
    const req = httpMock.expectOne('/api/business-profiles');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockProfile);
    req.flush(mockProfile);
  });

  it('should getProfileByUserId', () => {
    service.getProfileByUserId(5).subscribe(profile => {
      expect(profile.city).toBe('Bangalore');
    });
    const req = httpMock.expectOne('/api/business-profiles/user/5');
    expect(req.request.method).toBe('GET');
    req.flush(mockProfile);
  });

  it('should updateProfile via PUT', () => {
    const updated = { ...mockProfile, city: 'Mumbai' };
    service.updateProfile(1, updated).subscribe(profile => {
      expect(profile.city).toBe('Mumbai');
    });
    const req = httpMock.expectOne('/api/business-profiles/1');
    expect(req.request.method).toBe('PUT');
    req.flush(updated);
  });
});
