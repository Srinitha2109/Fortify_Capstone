import { Component, inject, signal, OnInit } from '@angular/core';

import { AdminService, UserRequest } from '../../../../../services/admin';
import { PolicyService } from '../../../../../services/policy';
import { PolicyApplicationService } from '../../../../../services/policy-application';
import { NotificationService } from '../../../../../services/notification';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-overview',
  standalone: true,
  imports: [],
  templateUrl: './overview.html',
  styleUrl: './overview.css'
})
export class OverviewComponent implements OnInit {
  private adminService = inject(AdminService);
  private policyService = inject(PolicyService);
  private policyAppService = inject(PolicyApplicationService);
  private router = inject(Router);

  stats = signal({
    pending: 0,
    totalUsers: 0,
    totalPolicies: 0,
    // activeAgents: 0,
    // pendingApplications: 0
  });

  recentRequests = signal<UserRequest[]>([]);

  ngOnInit() {
    this.loadStats();
    this.loadRecentRequests();
  }

  loadStats() {
    this.adminService.getPendingRegistrations().subscribe(data => {
      this.stats.update(s => ({ ...s, pending: data.length }));
    });
    this.adminService.getAllUsers().subscribe(users => {
      // const agentCount = users.filter(u => u.role === 'AGENT' && u.status === 'ACTIVE').length;
      this.stats.update(s => ({ ...s, totalUsers: users.length }));
    });
    this.policyService.getAllPolicies().subscribe(data => {
      this.stats.update(s => ({ ...s, totalPolicies: data.length }));
    });
  }

  loadRecentRequests() {
    this.adminService.getPendingRegistrations().subscribe(data => {
      this.recentRequests.set(data.slice(0, 3)); //shows latest 3 pending requests 
    });
  }

  navigateTo(path: string) {
    this.router.navigate(['/admin', path]);
  }
}
