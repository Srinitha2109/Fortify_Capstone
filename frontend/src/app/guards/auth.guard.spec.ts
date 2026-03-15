import 'zone.js';
import 'zone.js/testing';
import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { vi } from 'vitest';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  let routerSpy: any;

  // Helper to create a fake ActivatedRouteSnapshot with optional roles
  const createRoute = (roles?: string[]): ActivatedRouteSnapshot => {
    const route = new ActivatedRouteSnapshot();
    if (roles) {
      (route as any).data = { roles };
    } else {
      (route as any).data = {};
    }
    return route;
  };

  const fakeState = {} as RouterStateSnapshot;

  // Build a valid JWT token with given payload
  const buildToken = (payload: object): string => {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const body = btoa(JSON.stringify(payload));
    return `${header}.${body}.signature`;
  };

  beforeEach(() => {
    routerSpy = { navigate: vi.fn() };

    TestBed.configureTestingModule({
      providers: [{ provide: Router, useValue: routerSpy }]
    });

    localStorage.clear();
  });

  afterEach(() => localStorage.clear());

  it('should redirect to /login when no token in localStorage', () => {
    const result = TestBed.runInInjectionContext(() =>
      authGuard(createRoute(), fakeState)
    );
    expect(result).toBe(false);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should allow access when token exists and no role restriction', () => {
    localStorage.setItem('token', buildToken({ role: 'ADMIN' }));
    const result = TestBed.runInInjectionContext(() =>
      authGuard(createRoute(), fakeState)
    );
    expect(result).toBe(true);
  });

  it('should allow access when token exists and role matches expected roles', () => {
    localStorage.setItem('token', buildToken({ role: 'ADMIN' }));
    const result = TestBed.runInInjectionContext(() =>
      authGuard(createRoute(['ADMIN', 'POLICYHOLDER']), fakeState)
    );
    expect(result).toBe(true);
  });

  it('should redirect to /landing when token exists but role does not match', () => {
    localStorage.setItem('token', buildToken({ role: 'AGENT' }));
    const result = TestBed.runInInjectionContext(() =>
      authGuard(createRoute(['ADMIN']), fakeState)
    );
    expect(result).toBe(false);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/landing']);
  });

  it('should redirect to /login when token is malformed', () => {
    localStorage.setItem('token', 'not.a.valid.token.here');
    const result = TestBed.runInInjectionContext(() =>
      authGuard(createRoute(['ADMIN']), fakeState)
    );
    expect(result).toBe(false);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should allow access for POLICYHOLDER role matching expected', () => {
    localStorage.setItem('token', buildToken({ role: 'POLICYHOLDER' }));
    const result = TestBed.runInInjectionContext(() =>
      authGuard(createRoute(['POLICYHOLDER']), fakeState)
    );
    expect(result).toBe(true);
  });

  it('should allow access for CLAIM_OFFICER role matching expected', () => {
    localStorage.setItem('token', buildToken({ role: 'CLAIM_OFFICER' }));
    const result = TestBed.runInInjectionContext(() =>
      authGuard(createRoute(['CLAIM_OFFICER']), fakeState)
    );
    expect(result).toBe(true);
  });
});
