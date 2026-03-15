import 'zone.js';
import 'zone.js/testing';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { LoadingService } from './loading';

describe('LoadingService', () => {
  let service: LoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [LoadingService] });
    service = TestBed.inject(LoadingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with isLoading false', () => {
    expect(service.isLoading()).toBe(false);
  });

  it('should set isLoading to true after show() and 200ms delay', fakeAsync(() => {
    service.show();
    expect(service.isLoading()).toBe(false); // Not yet — debounced
    tick(200);
    expect(service.isLoading()).toBe(true);
    // cleanup
    service.hide();
    tick(500);
  }));

  it('should NOT show loading if hide() is called before 200ms', fakeAsync(() => {
    service.show();
    service.hide(); // called before debounce fires
    tick(400);
    expect(service.isLoading()).toBe(false);
  }));

  it('should set isLoading to false after hide() when no active requests', fakeAsync(() => {
    service.show();
    tick(200);
    expect(service.isLoading()).toBe(true);
    service.hide();
    tick(200);
    expect(service.isLoading()).toBe(false);
  }));

  it('should keep isLoading true while multiple requests are active', fakeAsync(() => {
    service.show();
    service.show(); // 2 active requests
    tick(200);
    expect(service.isLoading()).toBe(true);

    service.hide(); // 1 request done, still 1 active
    tick(200);
    expect(service.isLoading()).toBe(true);

    service.hide(); // all done
    tick(200);
    expect(service.isLoading()).toBe(false);
  }));

  it('should not go below 0 active requests on extra hide() calls', fakeAsync(() => {
    service.show();
    tick(200);
    service.hide();
    service.hide(); // extra call
    tick(200);
    expect(service.isLoading()).toBe(false); // No error thrown
  }));
});
