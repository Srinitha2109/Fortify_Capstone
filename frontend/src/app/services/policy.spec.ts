import 'zone.js';
import 'zone.js/testing';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PolicyService, Policy } from './policy';

describe('PolicyService', () => {
  let service: PolicyService;
  let httpMock: HttpTestingController;

  const mockPolicy: Policy = {
    id: 1,
    policyNumber: 'POL-GENE-0001',
    policyName: 'General Liability Shield',
    insuranceType: 'GENERAL_LIABILITY',
    insuranceTypeDisplayName: 'General Liability',
    description: 'Comprehensive general liability coverage',
    minCoverageAmount: 50000,
    maxCoverageAmount: 500000,
    basePremium: 1200,
    durationMonths: 12,
    isActive: true
  };

  const mockPolicies: Policy[] = [
    mockPolicy,
    {
      id: 2,
      policyNumber: 'POL-PROP-0001',
      policyName: 'Property Guard',
      insuranceType: 'PROPERTY_DAMAGE',
      description: 'Property damage coverage',
      minCoverageAmount: 100000,
      maxCoverageAmount: 1000000,
      basePremium: 2500,
      durationMonths: 24,
      isActive: true
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PolicyService]
    });
    service = TestBed.inject(PolicyService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should getAllPolicies via GET', () => {
    service.getAllPolicies().subscribe(policies => {
      expect(policies.length).toBe(2);
      expect(policies[0].policyName).toBe('General Liability Shield');
      expect(policies[1].insuranceType).toBe('PROPERTY_DAMAGE');
    });

    const req = httpMock.expectOne('/api/policies');
    expect(req.request.method).toBe('GET');
    req.flush(mockPolicies);
  });

  it('should getPolicyById for a specific policy', () => {
    service.getPolicyById(1).subscribe(policy => {
      expect(policy.policyName).toBe('General Liability Shield');
      expect(policy.basePremium).toBe(1200);
      expect(policy.durationMonths).toBe(12);
    });

    const req = httpMock.expectOne('/api/policies/1');
    expect(req.request.method).toBe('GET');
    req.flush(mockPolicy);
  });

  it('should createPolicy via POST', () => {
    const newPolicy: Policy = {
      policyNumber: '',
      policyName: 'Cyber Risk Plan',
      insuranceType: 'CYBER_LIABILITY',
      description: 'Cyber attack coverage',
      minCoverageAmount: 25000,
      maxCoverageAmount: 250000,
      basePremium: 800,
      durationMonths: 12,
      isActive: true
    };

    service.createPolicy(newPolicy).subscribe(policy => {
      expect(policy.id).toBe(3);
      expect(policy.policyName).toBe('Cyber Risk Plan');
    });

    const req = httpMock.expectOne('/api/policies');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newPolicy);
    req.flush({ ...newPolicy, id: 3, policyNumber: 'POL-CYBE-0003' });
  });

  it('should updatePolicy via PUT', () => {
    const updatedPolicy: Policy = { ...mockPolicy, basePremium: 1500, description: 'Updated description' };

    service.updatePolicy(1, updatedPolicy).subscribe(policy => {
      expect(policy.basePremium).toBe(1500);
      expect(policy.description).toBe('Updated description');
    });

    const req = httpMock.expectOne('/api/policies/1');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updatedPolicy);
    req.flush(updatedPolicy);
  });

  it('should getActivePolicies only returning active ones', () => {
    const activePolicies = mockPolicies.filter(p => p.isActive);

    service.getActivePolicies().subscribe(policies => {
      expect(policies.length).toBe(2);
      policies.forEach(p => expect(p.isActive).toBe(true));
    });

    const req = httpMock.expectOne('/api/policies/active');
    expect(req.request.method).toBe('GET');
    req.flush(activePolicies);
  });

  it('should getPoliciesByInsuranceType via GET with type path param', () => {
    service.getPoliciesByInsuranceType('GENERAL_LIABILITY').subscribe(policies => {
      expect(policies.length).toBe(1);
      expect(policies[0].insuranceType).toBe('GENERAL_LIABILITY');
    });

    const req = httpMock.expectOne('/api/policies/insurance-type/GENERAL_LIABILITY');
    expect(req.request.method).toBe('GET');
    req.flush([mockPolicy]);
  });

  it('should return empty list when no policies exist for given insurance type', () => {
    service.getPoliciesByInsuranceType('MARINE').subscribe(policies => {
      expect(policies.length).toBe(0);
    });

    const req = httpMock.expectOne('/api/policies/insurance-type/MARINE');
    req.flush([]);
  });
});
