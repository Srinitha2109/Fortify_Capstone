import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth';

export interface InAppNotification {
  id: number;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class InAppNotificationService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = '/api/notifications';

  notifications = signal<InAppNotification[]>([]);
  unreadCount = computed(() => this.notifications().filter(n => !n.isRead).length);

  private pollInterval: any = null;

  /** Call this when a user logs in to start polling */
  startPolling() {
    this.fetchNotifications();
    if (!this.pollInterval) {
      this.pollInterval = setInterval(() => this.fetchNotifications(), 30000); // poll every 30s
    }
  }

  /** Call this on logout */
  stopPolling() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
    this.notifications.set([]);
  }

  fetchNotifications() {
    const user = this.authService.currentUser();
    if (!user?.id) return;
    this.http.get<InAppNotification[]>(`${this.apiUrl}/my/${user.id}`).subscribe({
      next: (data) => this.notifications.set(data),
      error: (err) => console.error('Failed to fetch notifications', err)
    });
  }

  markAsRead(notificationId: number) {
    console.log("sending put request to "+notificationId+"/read");
    this.http.put(`${this.apiUrl}/${notificationId}/read`, {}).subscribe({
      next: () => {
        console.log("successfully marked read "+notificationId)
        this.notifications.update(list =>
          [...list].map(n => n.id === notificationId ? { ...n, isRead: true } : n)
        );
        // this.fetchNotifications();

      }
    });
  }

  markAllAsRead() {
    const user = this.authService.currentUser();
    if (!user?.id) return;
    this.http.put(`${this.apiUrl}/my/${user.id}/read-all`, {}).subscribe({
      next: () => {
        this.notifications.update(list => list.map(n => ({ ...n, isRead: true })));
      }
    });
  }
}
