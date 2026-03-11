import { Component, inject, signal } from '@angular/core';

import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../services/auth';
import { NotificationBellComponent } from '../../../shared/notification-bell/notification-bell.component';

@Component({
  selector: 'app-agent',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NotificationBellComponent],
  templateUrl: './agent.html',
  styleUrl: './agent.css'
})
export class AgentComponent {
  private authService = inject(AuthService);
  isSidebarCollapsed = signal(false);
  currentUser = this.authService.currentUser;

  toggleSidebar() {
    this.isSidebarCollapsed.set(!this.isSidebarCollapsed());
  }

  logout() {
    this.authService.logout();
  }

  getInitials(name: string | null | undefined): string {
    if (!name) return 'AG';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }
}
