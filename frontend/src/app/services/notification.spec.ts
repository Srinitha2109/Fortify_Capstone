import 'zone.js';
import 'zone.js/testing';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NotificationService } from './notification';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [NotificationService] });
    service = TestBed.inject(NotificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with no notifications', () => {
    expect(service.getNotifications()().length).toBe(0);
  });

  it('should add a notification on show()', () => {
    service.show('Hello World', 'success');
    const notifs = service.getNotifications()();
    expect(notifs.length).toBe(1);
    expect(notifs[0].message).toBe('Hello World');
    expect(notifs[0].type).toBe('success');
  });

  it('should default type to success when not provided', () => {
    service.show('Default Type');
    const notifs = service.getNotifications()();
    expect(notifs[0].type).toBe('success');
  });

  it('should support all notification types', () => {
    service.show('Error msg', 'error');
    service.show('Info msg', 'info');
    service.show('Warning msg', 'warning');
    const notifs = service.getNotifications()();
    expect(notifs.find(n => n.type === 'error')?.message).toBe('Error msg');
    expect(notifs.find(n => n.type === 'info')?.message).toBe('Info msg');
    expect(notifs.find(n => n.type === 'warning')?.message).toBe('Warning msg');
  });

  it('should assign unique ids to notifications', () => {
    service.show('Msg 1', 'info');
    service.show('Msg 2', 'error');
    const notifs = service.getNotifications()();
    expect(notifs[0].id).not.toBe(notifs[1].id);
  });

  it('should remove notification by id', () => {
    service.show('Temp', 'info');
    const id = service.getNotifications()()[0].id;
    service.remove(id);
    expect(service.getNotifications()().length).toBe(0);
  });

  it('should not affect other notifications when removing by id', () => {
    service.show('Keep', 'success');
    service.show('Remove', 'error');
    const notifs = service.getNotifications()();
    const removeId = notifs.find(n => n.message === 'Remove')!.id;
    service.remove(removeId);
    const remaining = service.getNotifications()();
    expect(remaining.length).toBe(1);
    expect(remaining[0].message).toBe('Keep');
  });

  it('should auto-remove notification after 5 seconds', fakeAsync(() => {
    service.show('Auto remove', 'success');
    expect(service.getNotifications()().length).toBe(1);
    tick(5000);
    expect(service.getNotifications()().length).toBe(0);
  }));
});
