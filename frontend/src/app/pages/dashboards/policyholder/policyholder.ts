import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-policyholder',
  imports: [CommonModule, RouterModule],
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
