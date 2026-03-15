import 'zone.js';
import 'zone.js/testing';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PaymentService, Payment } from './payment';

describe('PaymentService', () => {
  let service: PaymentService;
  let httpMock: HttpTestingController;

  const mockPayment: Payment = {
    id: 1,
    policyApplicationId: 10,
    amount: 5000,
    paymentMethod: 'CARD',
    paymentType: 'PREMIUM',
    status: 'SUCCESS',
    policyNumber: 'POL-001'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PaymentService]
    });
    service = TestBed.inject(PaymentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should createPayment via POST', () => {
    service.createPayment(mockPayment).subscribe(p => {
      expect(p.status).toBe('SUCCESS');
    });
    const req = httpMock.expectOne('/api/payments');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockPayment);
    req.flush(mockPayment);
  });

  it('should getPaymentsByApplication', () => {
    service.getPaymentsByApplication(10).subscribe(payments => {
      expect(payments.length).toBe(1);
      expect(payments[0].amount).toBe(5000);
    });
    const req = httpMock.expectOne('/api/payments/application/10');
    expect(req.request.method).toBe('GET');
    req.flush([mockPayment]);
  });

  it('should getPaymentsByUserId', () => {
    service.getPaymentsByUserId(5).subscribe(payments => {
      expect(payments[0].paymentMethod).toBe('CARD');
    });
    const req = httpMock.expectOne('/api/payments/user/5');
    expect(req.request.method).toBe('GET');
    req.flush([mockPayment]);
  });
});
