import {
  Component, inject, signal, HostListener, OnInit, OnDestroy
} from '@angular/core';

import { InAppNotificationService, InAppNotification } from '../../services/in-app-notification';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [],
  template: `
    <div class="notif-bell-wrapper" style="position:relative;display:inline-block;">
    
      <button class="notif-bell-btn" (click)="toggleDropdown($event)" [class.has-unread]="notifService.unreadCount() > 0"
              title="Notifications" type="button">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="notif-bell-icon">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        @if (notifService.unreadCount() > 0) {
          <span class="notif-badge">{{ notifService.unreadCount() > 9 ? '9+' : notifService.unreadCount() }}</span>
        }
      </button>

      <!-- Dropdown -->
      @if (isOpen()) {
        <div class="notif-dropdown" (click)="$event.stopPropagation()">
          <div class="notif-dropdown-header">
            <span class="notif-dropdown-title">Notifications</span>
            @if (notifService.unreadCount() > 0) {
              <button class="notif-mark-all-btn" (click)="markAllRead()" type="button">
                Mark all read
              </button>
            }
          </div>

          <div class="notif-list">
            @if (notifService.notifications().length === 0) {
              <div class="notif-empty">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="width:36px;height:36px;color:#cbd5e1;">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
                <p>No notifications yet</p>
              </div>
            }
            @for (n of notifService.notifications(); track n.id) {
              <div class="notif-item" [class.notif-unread]="!n.isRead" (click)="markRead(n)">
                <div class="notif-item-icon" [class]="'notif-icon-' + getIconClass(n.type)">
                  
                </div>
                <div class="notif-item-body">
                  <p class="notif-item-msg">{{ n.message }}</p>
                  <span class="notif-item-time">{{ formatTime(n.createdAt) }}</span>
                </div>
                @if (!n.isRead) {
                  <div class="notif-unread-dot"></div>
                }
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .notif-bell-btn {
      position: relative;
      background: none;
      border: none;
      cursor: pointer;
      padding: 8px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #64748b;
      transition: background 0.2s, color 0.2s;
    }

    .notif-bell-btn:hover {
      background: rgba(122, 0, 25, 0.07);
      color: #7a0019;
    }

    .notif-bell-btn.has-unread {
      color: #7a0019;
    }

    .notif-bell-icon {
      width: 22px;
      height: 22px;
    }

    .notif-badge {
      position: absolute;
      top: 2px;
      right: 2px;
      min-width: 17px;
      height: 17px;
      background: #e11d48;
      color: white;
      border-radius: 999px;
      font-size: 10px;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 4px;
      border: 2px solid white;
      line-height: 1;
    }

    .notif-dropdown {
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      width: 360px;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      box-shadow: 0 20px 40px -8px rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.08);
      z-index: 9999;
      overflow: hidden;
      animation: slideDown 0.18s ease;
    }

    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-8px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .notif-dropdown-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 18px 12px;
      border-bottom: 1px solid #f1f5f9;
    }

    .notif-dropdown-title {
      font-weight: 800;
      font-size: 0.95rem;
      color: #1e293b;
      letter-spacing: -0.01em;
    }

    .notif-mark-all-btn {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 0.75rem;
      font-weight: 700;
      color: #7a0019;
      padding: 4px 8px;
      border-radius: 6px;
      transition: background 0.2s;
    }

    .notif-mark-all-btn:hover {
      background: rgba(122, 0, 25, 0.07);
    }

    .notif-list {
      max-height: 380px;
      overflow-y: auto;
    }

    .notif-list::-webkit-scrollbar {
      width: 4px;
    }

    .notif-list::-webkit-scrollbar-track {
      background: transparent;
    }

    .notif-list::-webkit-scrollbar-thumb {
      background: #e2e8f0;
      border-radius: 4px;
    }

    .notif-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
      gap: 10px;
      color: #94a3b8;
    }

    .notif-empty p {
      font-size: 0.85rem;
      font-weight: 600;
      margin: 0;
    }

    .notif-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 14px 18px;
      cursor: pointer;
      transition: background 0.15s;
      border-bottom: 1px solid #f8fafc;
      position: relative;
    }

    .notif-item:last-child {
      border-bottom: none;
    }

    .notif-item:hover {
      background: #f8fafc;
    }

    .notif-item.notif-unread {
      background: #fdf2f4;
    }

    .notif-item.notif-unread:hover {
      background: #fce7eb;
    }

    .notif-item-icon {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      flex-shrink: 0;
    }

    .notif-icon-policy   { background: #f0fdf4; }
    .notif-icon-app      { background: #eff6ff; }
    .notif-icon-claim    { background: #fff7ed; }
    .notif-icon-approved { background: #f0fdf4; }
    .notif-icon-rejected { background: #fef2f2; }
    .notif-icon-default  { background: #f8fafc; }

    .notif-item-body {
      flex: 1;
      min-width: 0;
    }

    .notif-item-msg {
      font-size: 0.82rem;
      color: #334155;
      margin: 0 0 4px;
      line-height: 1.4;
      font-weight: 500;
    }

    .notif-unread .notif-item-msg {
      color: #1e293b;
      font-weight: 600;
    }

    .notif-item-time {
      font-size: 0.72rem;
      color: #94a3b8;
      font-weight: 600;
    }

    .notif-unread-dot {
      width: 8px;
      height: 8px;
      background: #7a0019;
      border-radius: 50%;
      flex-shrink: 0;
      margin-top: 4px;
    }
  `]
})
export class NotificationBellComponent implements OnInit, OnDestroy {
  notifService = inject(InAppNotificationService);
  isOpen = signal(false);

  ngOnInit() {
    this.notifService.startPolling();
  }

  ngOnDestroy() {
    this.notifService.stopPolling();
  }

  toggleDropdown(event: Event) {
    event.stopPropagation();
    this.isOpen.update(v => !v);
  }

  @HostListener('document:click')
  closeDropdown() {
    this.isOpen.set(false);
  }

  markRead(n: InAppNotification) {
    if (!n.isRead) {
      this.notifService.markAsRead(n.id);
      console.log("marking  "+n.id);
    }
  }

  markAllRead() {
    this.notifService.markAllAsRead();
  }

  getIconClass(type: string): string {
    switch (type) {
      case 'NEW_POLICY': return 'policy';
      case 'APPLICATION_SUBMITTED': return 'app';
      case 'APPLICATION_APPROVED': return 'approved';
      case 'APPLICATION_REJECTED': return 'rejected';
      case 'CLAIM_RAISED': return 'claim';
      case 'CLAIM_APPROVED': return 'approved';
      case 'CLAIM_REJECTED': return 'rejected';
      default: return 'default';
    }
  }

  formatTime(createdAt: string): string {
    if (!createdAt) return '';
    const date = new Date(createdAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}
