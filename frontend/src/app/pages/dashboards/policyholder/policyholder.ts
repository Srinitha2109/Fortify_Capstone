import { Component, inject, signal } from '@angular/core';

import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth';
import { NotificationBellComponent } from '../../../shared/notification-bell/notification-bell.component';

@Component({
  selector: 'app-policyholder',
  imports: [RouterModule, NotificationBellComponent],
  templateUrl: './policyholder.html',
  styleUrl: './policyholder.css',
})
export class PolicyholderComponent {
  private authService = inject(AuthService);
  isSidebarCollapsed = signal(false);

  toggleSidebar() {
    this.isSidebarCollapsed.set(!this.isSidebarCollapsed());
  }

  logout() {
    this.authService.logout();
  }
}
