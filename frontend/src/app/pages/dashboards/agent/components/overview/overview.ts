import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PolicyApplicationService, PolicyApplication } from '../../../../../services/policy-application';
import { AuthService } from '../../../../../services/auth';
import { NotificationService } from '../../../../../services/notification';

@Component({
    selector: 'app-agent-overview',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './overview.html',
    styleUrl: './overview.css'
})
export class OverviewComponent implements OnInit {
    private policyAppService = inject(PolicyApplicationService);
    private authService = inject(AuthService);
    private notificationService = inject(NotificationService);

    requests = signal<PolicyApplication[]>([]);
    currentUser = signal<any>(null);

    pendingCount = computed(() => this.requests().filter(r => r.status === 'SUBMITTED' || r.status === 'UNDER_REVIEW').length);
    approvedCount = computed(() => this.requests().filter(r => r.status === 'APPROVED' || r.status === 'ACTIVE').length);
    recentRequests = computed(() => this.requests().slice(0, 5));

    ngOnInit() {
        this.currentUser.set(this.authService.currentUser());
        this.loadApplications();
    }

    loadApplications() {
        const user = this.currentUser();
        if (user && user.id) {
            this.policyAppService.getApplicationsByAgentId(user.id).subscribe({
                next: (apps) => this.requests.set(apps),
                error: () => this.notificationService.show('Failed to load dashboard data', 'error')
            });
        }
    }

    getInitials(name: string | undefined): string {
        if (!name) return 'AG';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
}
