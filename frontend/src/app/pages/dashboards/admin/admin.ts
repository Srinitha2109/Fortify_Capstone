import { Component, inject, signal } from '@angular/core';

import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../services/auth';
import { NotificationBellComponent } from '../../../shared/notification-bell/notification-bell.component';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [RouterModule, NotificationBellComponent],
  templateUrl: './admin.html',
})
export class AdminComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  isSidebarOpen = signal(true);

  toggleSidebar() {
    this.isSidebarOpen.update(v => !v);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
