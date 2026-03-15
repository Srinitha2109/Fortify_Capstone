import 'zone.js';
import 'zone.js/testing';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { vi } from 'vitest';
import { InAppNotificationService, InAppNotification } from './in-app-notification';
import { AuthService } from './auth';

describe('InAppNotificationService', () => {
  let service: InAppNotificationService;
  let httpMock: HttpTestingController;
  let authServiceSpy: any;

  const mockUser = { id: 5, fullName: 'Test User' };

  const mockNotifications: InAppNotification[] = [
    { id: 1, message: 'Policy approved', type: 'APPLICATION_APPROVED', isRead: false, createdAt: new Date().toISOString() },
    { id: 2, message: 'Claim submitted', type: 'CLAIM_RAISED', isRead: true, createdAt: new Date().toISOString() }
  ];

  beforeEach(() => {
    authServiceSpy = { currentUser: vi.fn() };
    authServiceSpy.currentUser.mockReturnValue(mockUser);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        InAppNotificationService,
        { provide: AuthService, useValue: authServiceSpy }
      ]
    });

    service = TestBed.inject(InAppNotificationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    service.stopPolling();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with empty notifications', () => {
    expect(service.notifications()).toEqual([]);
  });

  it('should compute unreadCount correctly', () => {
    service.notifications.set(mockNotifications);
    expect(service.unreadCount()).toBe(1); // only 1 unread
  });

  it('should fetchNotifications and set them', () => {
    service.fetchNotifications();
    const req = httpMock.expectOne(`/api/notifications/my/${mockUser.id}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockNotifications);
    expect(service.notifications().length).toBe(2);
  });

  it('should not fetch if user has no id', () => {
    authServiceSpy.currentUser.mockReturnValue(null);
    service.fetchNotifications();
    httpMock.expectNone(`/api/notifications/my/${mockUser.id}`);
  });

  it('should markAsRead by id via PUT', () => {
    service.notifications.set(mockNotifications);
    service.markAsRead(1);

    const req = httpMock.expectOne('/api/notifications/1/read');
    expect(req.request.method).toBe('PUT');
    req.flush({});

    const updated = service.notifications().find(n => n.id === 1);
    expect(updated?.isRead).toBe(true);
  });

  it('should markAllAsRead via PUT and mark all notifications as read', () => {
    service.notifications.set(mockNotifications);
    service.markAllAsRead();

    const req = httpMock.expectOne(`/api/notifications/my/${mockUser.id}/read-all`);
    expect(req.request.method).toBe('PUT');
    req.flush({});

    expect(service.notifications().every(n => n.isRead)).toBe(true);
  });

  it('should not markAllAsRead if user has no id', () => {
    authServiceSpy.currentUser.mockReturnValue(null);
    service.markAllAsRead();
    httpMock.expectNone((req) => req.url.includes('read-all'));
  });

  it('should stopPolling and clear notifications', () => {
    service.notifications.set(mockNotifications);
    service.stopPolling();
    expect(service.notifications()).toEqual([]);
  });
});
