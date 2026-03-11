import { Injectable, signal } from '@angular/core';

export interface AppNotification {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  id: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications = signal<AppNotification[]>([]);
  private counter = 0;

  getNotifications() {
    return this.notifications.asReadonly();
  }

  show(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') {
    const id = this.counter++;
    const notification: AppNotification = { message, type, id };
    this.notifications.update(n => [...n, notification]);

    setTimeout(() => {
      this.remove(id);
    }, 5000);
  }

  remove(id: number) {
    this.notifications.update(n => n.filter(item => item.id !== id));
  }
}
