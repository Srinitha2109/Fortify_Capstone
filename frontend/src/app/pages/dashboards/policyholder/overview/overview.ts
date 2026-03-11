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
    template: `
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center">
            <span class="text-xs text-slate-500 font-bold uppercase tracking-widest text-center">Active Policies</span>
            <span class="text-4xl font-black text-burgundy mt-2 text-center">
                @if (isLoading()) {
                    <span class="animate-pulse">...</span>
                } @else {
                    {{ activePoliciesCount() }}
                }
            </span>
        </div>
        <div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center">
            <span class="text-xs text-slate-500 font-bold uppercase tracking-widest text-center">Pending Applications</span>
            <span class="text-4xl font-black text-burgundy mt-2 text-center">
                @if (isLoading()) {
                    <span class="animate-pulse">...</span>
                } @else {
                    {{ pendingApplicationsCount() }}
                }
            </span>
        </div>
        
    </div>

    <div class="flex flex-col gap-8">
        <section class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 class="text-lg font-extrabold text-burgundy tracking-tight mb-4">Quick Actions</h2>
            <div class="flex flex-wrap gap-4">
                <button routerLink="/policyholder/policies" class="px-6 py-3 bg-burgundy text-white text-sm font-bold rounded-xl hover:bg-burgundy-secondary transition-colors shadow-sm">
                    Browse New Policies
                </button>
                <button routerLink="/policyholder/claims" class="px-6 py-3 bg-white border-2 border-slate-200 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-colors">
                    File a Claim
                </button>
            </div>
        </section>

        <section class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
             <div class="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                 <h2 class="text-lg font-extrabold text-burgundy tracking-tight">Available Policies Catalog</h2>
                 <a routerLink="/policyholder/policies" class="text-xs font-bold text-pink hover:text-burgundy uppercase tracking-widest transition-colors cursor-pointer">View All</a>
             </div>
             
             @if (isLoading()) {
                 <div class="flex flex-col gap-4 animate-pulse">
                     <div class="h-24 bg-slate-100 rounded-xl w-full"></div>
                     <div class="h-24 bg-slate-100 rounded-xl w-full"></div>
                 </div>
             } @else {
                 <div class="flex flex-col gap-4">
                     @for (policy of activePolicies().slice(0,3); track policy.id) {
                         <div class="flex justify-between items-center p-5 bg-slate-50 border border-slate-200 rounded-xl hover:bg-white hover:shadow-md transition-all group">
                             <div class="flex flex-col">
                                 <strong class="text-slate-800 font-extrabold text-lg group-hover:text-burgundy transition-colors">{{ policy.policyName }}</strong>
                                 <span class="text-xs text-slate-500 font-semibold tracking-wide flex items-center gap-2 mt-1">
                                     <span class="px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px]">{{ policy.insuranceTypeDisplayName }}</span>
                                     Policy #{{ policy.policyNumber }}
                                 </span>
                             </div>
                             <div class="flex flex-col items-end gap-2">
                                <span class="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-black uppercase rounded-full ring-1 ring-green-200">
                                    Available
                                </span>
                                <span class="text-sm font-black text-burgundy">{{ policy.basePremium | currency }}</span>
                             </div>
                         </div>
                     } @empty {
                         <div class="p-8 text-center text-slate-500 font-bold bg-slate-50 rounded-xl border border-dashed border-slate-300">
                             No active policies found in the catalog.
                         </div>
                     }
                 </div>
             }
        </section>
    </div>
  `
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
