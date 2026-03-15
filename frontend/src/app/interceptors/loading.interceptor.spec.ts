import 'zone.js';
import 'zone.js/testing';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { vi } from 'vitest';
import { loadingInterceptor } from './loading.interceptor';
import { LoadingService } from '../services/loading';

describe('loadingInterceptor', () => {
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;
  let loadingService: LoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([loadingInterceptor])),
        LoadingService
      ]
    });
    httpMock = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
    loadingService = TestBed.inject(LoadingService);
  });

  afterEach(() => httpMock.verify());

  it('should call show() and hide() on a regular API request', fakeAsync(() => {
    const showSpy = vi.spyOn(loadingService, 'show');
    const hideSpy = vi.spyOn(loadingService, 'hide');

    httpClient.get('/api/policies').subscribe();
    const req = httpMock.expectOne('/api/policies');
    req.flush([]);
    tick(200);

    expect(showSpy).toHaveBeenCalled();
    expect(hideSpy).toHaveBeenCalled();
  }));

  it('should NOT call show() for notifications endpoint (excluded)', fakeAsync(() => {
    const showSpy = vi.spyOn(loadingService, 'show');

    httpClient.get('/api/notifications/my/5').subscribe();
    const req = httpMock.expectOne('/api/notifications/my/5');
    req.flush([]);
    tick();

    expect(showSpy).not.toHaveBeenCalled();
  }));

  it('should NOT call show() for claims/policy-application endpoint (excluded)', fakeAsync(() => {
    const showSpy = vi.spyOn(loadingService, 'show');

    httpClient.get('/api/claims/policy-application/1').subscribe();
    const req = httpMock.expectOne('/api/claims/policy-application/1');
    req.flush([]);
    tick();

    expect(showSpy).not.toHaveBeenCalled();
  }));

  it('should NOT call show() for policy-applications/user endpoint (excluded)', fakeAsync(() => {
    const showSpy = vi.spyOn(loadingService, 'show');

    httpClient.get('/api/policy-applications/user/5').subscribe();
    const req = httpMock.expectOne('/api/policy-applications/user/5');
    req.flush([]);
    tick();

    expect(showSpy).not.toHaveBeenCalled();
  }));

  it('should call hide() even when request fails', fakeAsync(() => {
    const hideSpy = vi.spyOn(loadingService, 'hide');

    httpClient.get('/api/admin/users').subscribe({ error: () => { } });
    const req = httpMock.expectOne('/api/admin/users');
    req.flush('Error', { status: 500, statusText: 'Server Error' });
    tick(200);

    expect(hideSpy).toHaveBeenCalled();
  }));
});
