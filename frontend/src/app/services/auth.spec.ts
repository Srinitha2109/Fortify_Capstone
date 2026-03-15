import 'zone.js';
import 'zone.js/testing';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { vi } from 'vitest';
import { AuthService } from './auth';
import { NotificationService } from './notification';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let routerSpy: any;
  let notificationSpy: any;

  beforeEach(() => {
    routerSpy = { navigate: vi.fn() };
    notificationSpy = { show: vi.fn() };

    localStorage.clear();

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: Router, useValue: routerSpy },
        { provide: NotificationService, useValue: notificationSpy }
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize currentUser from localStorage if token exists', () => {
    localStorage.setItem('user', JSON.stringify({ id: 1, fullName: 'Test User' }));
    // Re-create service test using runInInjectionContext to handle field inject() calls
    TestBed.runInInjectionContext(() => {
        const freshService = new AuthService();
        expect(freshService.currentUser()).toEqual({ id: 1, fullName: 'Test User' });
    });
  });

  it('should clear corrupt localStorage user data on init', () => {
    localStorage.setItem('user', 'not-valid-json');
    TestBed.runInInjectionContext(() => {
        const freshService = new AuthService();
        expect(freshService.currentUser()).toBeNull();
        expect(localStorage.getItem('user')).toBeNull();
    });
  });

  it('should call register endpoint with userData', () => {
    const userData = { fullName: 'John', email: 'john@gmail.com' };
    service.register(userData).subscribe();
    const req = httpMock.expectOne('/api/auth/request-registration');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(userData);
    req.flush({});
  });

  it('should login and navigate to admin route on ADMIN role', fakeAsync(() => {
    const credentials = { email: 'admin@gmail.com', password: 'pass', role: 'ADMIN' };
    const mockResponse = { userId: 1, token: 'test-token', role: 'ADMIN' };

    service.login(credentials);

    const req = httpMock.expectOne('/api/auth/login');
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
    tick();

    expect(localStorage.getItem('token')).toBe('test-token');
    expect(notificationSpy.show).toHaveBeenCalledWith('Logged in successfully', 'success');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/admin/dashboard']);
  }));

  it('should login and navigate to policyholder route on POLICYHOLDER role', fakeAsync(() => {
    const credentials = { email: 'ph@gmail.com', password: 'pass', role: 'POLICYHOLDER' };
    service.login(credentials);
    const req = httpMock.expectOne('/api/auth/login');
    req.flush({ userId: 2, token: 'token2', role: 'POLICYHOLDER' });
    tick();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/policyholder/dashboard']);
  }));

  it('should login and navigate to agent route on AGENT role', fakeAsync(() => {
    const credentials = { email: 'ag@gmail.com', password: 'pass', role: 'AGENT' };
    service.login(credentials);
    const req = httpMock.expectOne('/api/auth/login');
    req.flush({ userId: 3, token: 'token3', role: 'AGENT' });
    tick();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/agent/dashboard']);
  }));

  it('should login and navigate to claim-officer route on CLAIM_OFFICER role', fakeAsync(() => {
    const credentials = { email: 'co@gmail.com', password: 'pass', role: 'CLAIM_OFFICER' };
    service.login(credentials);
    const req = httpMock.expectOne('/api/auth/login');
    req.flush({ userId: 4, token: 'token4', role: 'CLAIM_OFFICER' });
    tick();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/claim-officer/dashboard']);
  }));

  it('should navigate to /landing on unknown role', fakeAsync(() => {
    const credentials = { email: 'u@gmail.com', password: 'pass', role: 'UNKNOWN' };
    service.login(credentials);
    const req = httpMock.expectOne('/api/auth/login');
    req.flush({ userId: 5, token: 'token5', role: 'UNKNOWN' });
    tick();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/landing']);
  }));

  it('should show error notification on login failure', fakeAsync(() => {
    const credentials = { email: 'bad@gmail.com', password: 'wrong', role: 'ADMIN' };
    service.login(credentials);
    const req = httpMock.expectOne('/api/auth/login');
    req.flush({ message: 'Invalid credentials' }, { status: 401, statusText: 'Unauthorized' });
    tick();
    expect(notificationSpy.show).toHaveBeenCalledWith('Invalid credentials', 'error');
  }));

  it('should logout and clear localStorage then navigate to landing', () => {
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('user', JSON.stringify({ id: 1 }));

    service.logout();

    expect(service.currentUser()).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/landing']);
  });

  it('should set id to userId on login response', fakeAsync(() => {
    const credentials = { email: 'admin@gmail.com', password: 'pass', role: 'ADMIN' };
    service.login(credentials);
    const req = httpMock.expectOne('/api/auth/login');
    req.flush({ userId: 10, token: 'tok', role: 'ADMIN' });
    tick();
    expect(service.currentUser()?.id).toBe(10);
  }));
});
