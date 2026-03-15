import 'zone.js';
import 'zone.js/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { vi } from 'vitest';
import { NotificationBellComponent } from './notification-bell.component';
import { InAppNotificationService, InAppNotification } from '../../services/in-app-notification';
import { AuthService } from '../../services/auth';

describe('NotificationBellComponent', () => {
  let component: NotificationBellComponent;
  let fixture: ComponentFixture<NotificationBellComponent>;
  let notifServiceMock: any;

  const mockNotifications: InAppNotification[] = [
    {
      id: 1,
      message: 'Policy approved for your business',
      type: 'APPLICATION_APPROVED',
      isRead: false,
      createdAt: new Date(Date.now() - 5 * 60000).toISOString() // 5 mins ago
    },
    {
      id: 2,
      message: 'Your claim has been submitted',
      type: 'CLAIM_RAISED',
      isRead: true,
      createdAt: new Date(Date.now() - 2 * 3600000).toISOString() // 2 hrs ago
    }
  ];

  beforeEach(async () => {
    const authServiceMock = {
      currentUser: vi.fn().mockReturnValue({ id: 1, fullName: 'Test User' })
    };

    notifServiceMock = {
        markAsRead: vi.fn(),
        markAllAsRead: vi.fn(),
        notifications: vi.fn().mockReturnValue([]),
        unreadCount: vi.fn().mockReturnValue(0),
        startPolling: vi.fn(),
        stopPolling: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [NotificationBellComponent, HttpClientTestingModule],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: InAppNotificationService, useValue: notifServiceMock }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotificationBellComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start with dropdown closed', () => {
    expect(component.isOpen()).toBe(false);
  });

  it('should toggle dropdown open on toggleDropdown()', () => {
    const mockEvent = new MouseEvent('click');
    vi.spyOn(mockEvent, 'stopPropagation');

    component.toggleDropdown(mockEvent);

    expect(component.isOpen()).toBe(true);
    expect(mockEvent.stopPropagation).toHaveBeenCalled();
  });

  it('should close dropdown on closeDropdown()', () => {
    component.isOpen.set(true);
    component.closeDropdown();
    expect(component.isOpen()).toBe(false);
  });

  it('should toggle dropdown off when already open', () => {
    component.isOpen.set(true);
    const mockEvent = new MouseEvent('click');
    vi.spyOn(mockEvent, 'stopPropagation');

    component.toggleDropdown(mockEvent);

    expect(component.isOpen()).toBe(false);
  });

  it('should return correct icon class for APPLICATION_APPROVED', () => {
    expect(component.getIconClass('APPLICATION_APPROVED')).toBe('approved');
  });

  it('should return correct icon class for APPLICATION_REJECTED', () => {
    expect(component.getIconClass('APPLICATION_REJECTED')).toBe('rejected');
  });

  it('should return correct icon class for CLAIM_RAISED', () => {
    expect(component.getIconClass('CLAIM_RAISED')).toBe('claim');
  });

  it('should return correct icon class for CLAIM_APPROVED', () => {
    expect(component.getIconClass('CLAIM_APPROVED')).toBe('approved');
  });

  it('should return correct icon class for CLAIM_REJECTED', () => {
    expect(component.getIconClass('CLAIM_REJECTED')).toBe('rejected');
  });

  it('should return correct icon class for NEW_POLICY', () => {
    expect(component.getIconClass('NEW_POLICY')).toBe('policy');
  });

  it('should return correct icon class for APPLICATION_SUBMITTED', () => {
    expect(component.getIconClass('APPLICATION_SUBMITTED')).toBe('app');
  });

  it('should return "default" icon class for unknown type', () => {
    expect(component.getIconClass('UNKNOWN_TYPE')).toBe('default');
  });

  it('should return "Just now" for a createdAt less than 1 minute ago', () => {
    const justNow = new Date().toISOString();
    expect(component.formatTime(justNow)).toBe('Just now');
  });

  it('should return minutes ago for recent notifications', () => {
    const thirtyMinsAgo = new Date(Date.now() - 30 * 60000).toISOString();
    expect(component.formatTime(thirtyMinsAgo)).toBe('30m ago');
  });

  it('should return hours ago for notifications within 24 hours', () => {
    const threeHoursAgo = new Date(Date.now() - 3 * 3600000).toISOString();
    expect(component.formatTime(threeHoursAgo)).toBe('3h ago');
  });

  it('should return days ago for notifications within a week', () => {
    const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString();
    expect(component.formatTime(twoDaysAgo)).toBe('2d ago');
  });

  it('should return empty string for null/empty createdAt', () => {
    expect(component.formatTime('')).toBe('');
  });

  it('should call notifService.markAsRead when markRead() is called with unread notification', () => {
    const unreadNotif = mockNotifications[0]; // isRead: false
    // We already have a mock in providers, but let's ensure it's used
    component.markRead(unreadNotif);

    expect(notifServiceMock.markAsRead).toHaveBeenCalledWith(1);
  });

  it('should NOT call notifService.markAsRead for already read notification', () => {
    const readNotif = mockNotifications[1]; // isRead: true
    component.markRead(readNotif);

    expect(notifServiceMock.markAsRead).not.toHaveBeenCalled();
  });

  it('should call notifService.markAllAsRead when markAllRead() is called', () => {
    component.markAllRead();
    expect(notifServiceMock.markAllAsRead).toHaveBeenCalled();
  });
});
