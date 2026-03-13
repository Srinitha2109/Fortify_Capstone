import { Component, inject, signal } from '@angular/core';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth';
import { NotificationBellComponent } from '../../../shared/notification-bell/notification-bell.component';
import { PolicySearchService } from '../../../services/policy-search.service';

@Component({
  selector: 'app-policyholder',
  imports: [RouterModule, NotificationBellComponent, CommonModule, FormsModule],
  templateUrl: './policyholder.html',
  styleUrl: './policyholder.css',
})
export class PolicyholderComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  readonly policySearchService = inject(PolicySearchService);

  isSidebarCollapsed = signal(false);
  isOnPoliciesPage = signal(false);
  navSearchQuery = signal('');

  constructor() {
    // Detect when we navigate to/from the policies page
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: NavigationEnd) => {
        const onPolicies = e.urlAfterRedirects.includes('/policyholder/policies');
        this.isOnPoliciesPage.set(onPolicies);
        if (!onPolicies) {
          // Reset search when leaving the policies page
          this.navSearchQuery.set('');
          this.policySearchService.reset();
        }
      });

    // Also check the initial URL on component load
    const url = this.router.url;
    this.isOnPoliciesPage.set(url.includes('/policyholder/policies'));
  }

  onNavSearch(query: string) {
    this.navSearchQuery.set(query);
    this.policySearchService.setQuery(query);
  }

  toggleSidebar() {
    this.isSidebarCollapsed.set(!this.isSidebarCollapsed());
  }

  logout() {
    this.authService.logout();
  }
}
