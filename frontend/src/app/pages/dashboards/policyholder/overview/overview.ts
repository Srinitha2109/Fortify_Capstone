import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PolicyService, Policy } from '../../../../services/policy';
import { AuthService } from '../../../../services/auth';
// Import PolicyApplication and PolicyApplicationService (we'll need to create the service if it doesn't exist yet, but for now we assume it does based on the controller)
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RouterLink } from '@angular/router';

// Temporary interface until we create a proper service file
interface PolicyApplication {
    id: number;
    status: string;
}

@Component({
    selector: 'app-policyholder-overview',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './overview.html',
    styleUrl: './overview.css'
})
export class OverviewComponent implements OnInit {
    private policyService = inject(PolicyService);
    private authService = inject(AuthService);
    private http = inject(HttpClient);

    activePolicies = signal<Policy[]>([]);
    activePoliciesCount = signal<number>(0);
    pendingApplicationsCount = signal<number>(0);
    isLoading = signal<boolean>(true);

    ngOnInit() {
        this.fetchData();
    }

    fetchData() {
        this.isLoading.set(true);
        const currentUser = this.authService.currentUser();
        const userId = currentUser ? currentUser.userId : null;

        // Fetch active policies for display
        this.policyService.getActivePolicies().subscribe({
            next: (policies) => {
                this.activePolicies.set(policies);
                this.activePoliciesCount.set(policies.length);

                // Fetch user applications if user is logged in
                if (userId) {
                    this.http.get<PolicyApplication[]>(`/api/policyholder/my-applications/${userId}`)
                        .subscribe({
                            next: (apps) => {
                                const pending = apps.filter(app => app.status === 'SUBMITTED' ||
                                    app.status === 'UNDER_REVIEW').length;
                                this.pendingApplicationsCount.set(pending);
                                this.isLoading.set(false);
                            },
                            error: (err) => {
                                console.error('Error fetching applications', err);
                                this.isLoading.set(false);
                            }
                        });
                } else {
                    this.isLoading.set(false);
                }
            },
            error: (err) => {
                console.error('Error fetching policies', err);
                this.isLoading.set(false);
            }
        });
    }
}
