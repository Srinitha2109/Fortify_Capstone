import { Component, inject, signal, OnInit, computed } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { PolicyService, Policy } from '../../../../services/policy';
import { AuthService } from '../../../../services/auth';
import { BusinessProfileService, BusinessProfile } from '../../../../services/business-profile';
import { PolicyApplicationService } from '../../../../services/policy-application';
import { NotificationService } from '../../../../services/notification';

@Component({
    selector: 'app-policyholder-policies',
    standalone: true,
    imports: [FormsModule],
    templateUrl: './policies.html',
    // styleUrl: './policies.css'
})
export class PoliciesComponent implements OnInit {
    private policyService = inject(PolicyService);
    private authService = inject(AuthService);
    private businessProfileService = inject(BusinessProfileService);
    private policyAppService = inject(PolicyApplicationService);
    private notificationService = inject(NotificationService);

    allPolicies = signal<Policy[]>([]);
    userApplications = signal<any[]>([]);
    isLoading = signal(true);
    searchQuery = signal('');

    businessProfile = signal<BusinessProfile | null>(null);
    selectedPolicyForApp = signal<Policy | null>(null);
    calculatedPremium = signal<number | null>(null);
    selectedCoverageAmount = signal<number>(0);
    selectedPaymentPlan = signal<'MONTHLY' | 'SIX_MONTHS' | 'ANNUALLY'>('MONTHLY');

    coverageError = computed(() => {
        const amount = this.selectedCoverageAmount();
        const policy = this.selectedPolicyForApp();
        if (!policy) return null;
        if (policy.minCoverageAmount != null && amount < policy.minCoverageAmount) {
            return `Coverage amount must be at least ${policy.minCoverageAmount}`;
        }
        if (policy.maxCoverageAmount != null && amount > policy.maxCoverageAmount) {
            return `Coverage amount cannot exceed ${policy.maxCoverageAmount}`;
        }
        return null;
    });

    // Pagination
    currentPage = signal(1);
    pageSize = signal(6);
    onSearch(query: string) {
        this.searchQuery.set(query);
        this.currentPage.set(1);
    }

    changePage(page: number) {
        if (page >= 1 && page <= this.totalPages()) {
            this.currentPage.set(page);
        }
    }
    ngOnInit() {
        this.loadPolicies();
        this.loadBusinessProfile();
        this.loadUserApplications();
    }
    loadPolicies() {
        this.policyService.getAllPolicies().subscribe({
            next: (policies) => {
                setTimeout(() => {
                    this.allPolicies.set(policies.filter(p => p.isActive));
                    this.isLoading.set(false);
                }, 3000)
            },
            error: () => {
                this.isLoading.set(false);
            }
        });
    }

    filteredPolicies = computed(() => {
        const query = this.searchQuery().toLowerCase().trim();
        let filtered = this.allPolicies();

        if (query) {
            const terms = query.split(/\s+/);
            filtered = filtered.filter(p => {
                const searchText = `${p.policyName} ${p.description} ${p.insuranceType}`.toLowerCase();
                return terms.every(term => searchText.includes(term));
            });
        }

        return filtered;
    });

    paginatedPolicies = computed(() => {
        const startIndex = (this.currentPage() - 1) * this.pageSize();
        return this.filteredPolicies().slice(startIndex, startIndex + this.pageSize());
    });

    totalPages = computed(() => Math.ceil(this.filteredPolicies().length / this.pageSize()));



    loadBusinessProfile() {
        const user = this.authService.currentUser();
        console.log(' loadBusinessProfile - user:', user);
        if (user && user.id) {
            this.businessProfileService.getProfileByUserId(user.id).subscribe({
                next: (profile) => {
                    console.log('Business profile loaded:', profile);
                    console.log('Profile agentId:', profile?.agentId);
                    this.businessProfile.set(profile);
                },
                error: (err) => {
                    console.error('Failed to load business profile', err);
                    console.error('HTTP status:', err.status);
                }
            });
        } else {
            console.error('  No user or user.id found for loading business profile');
        }
    }

    loadUserApplications() {
        const user = this.authService.currentUser();
        if (user && user.id) {
            this.policyAppService.getApplicationsByUserId(user.id).subscribe({
                next: (apps) => this.userApplications.set(apps),
                error: (err) => console.error('Failed to load user applications', err)
            });
        }
    }

    getPolicyStatus(policyId: number | undefined): string | null {
        if (!policyId) return null;
        const app = this.userApplications().find(a => a.planId === policyId);
        return app ? app.status : null;
    }



    selectPolicy(policy: Policy) {
        const profile = this.businessProfile();
        if (!profile) {
            this.notificationService.show(
                'Your business profile is not set up yet. Please contact the admin.',
                'warning'
            );
            return;
        }

        if (!profile.agentId) {
            this.notificationService.show(
                'Your account is pending professional staff assignment. Admin is currently assigning an agent to your profile. Please check back later.',
                'info'
            );
            return;
        }
        this.selectedPolicyForApp.set(policy);
        this.selectedCoverageAmount.set(policy.minCoverageAmount);
        this.previewPremium();
    }

    closeModal() {
        this.selectedPolicyForApp.set(null);
        this.calculatedPremium.set(null);
        this.selectedPaymentPlan.set('MONTHLY');
    }

    previewPremium() {
        const policy = this.selectedPolicyForApp();
        const profile = this.businessProfile();
        if (policy && profile && profile.id) {
            const amount = this.selectedCoverageAmount();
            if (
                (policy.minCoverageAmount != null && amount < policy.minCoverageAmount) ||
                (policy.maxCoverageAmount != null && amount > policy.maxCoverageAmount)
            ) {
                this.calculatedPremium.set(null); // Clear premium to disable submit
                return;
            }

            this.policyAppService.calculatePremiumPreview({
                planId: policy.id!,
                coverageAmount: this.selectedCoverageAmount(),
                businessProfileId: profile.id,
                paymentPlan: this.selectedPaymentPlan()
            }).subscribe({
                next: (premium) => {
                    this.calculatedPremium.set(premium);
                }
                // error: () => {
                //     this.notificationService.show('Failed to calculate premium', 'error');
                // }
            });
        }
    }

    submitApplication() {
        const policy = this.selectedPolicyForApp();
        const profile = this.businessProfile();
        const user = this.authService.currentUser();

        if (policy && profile && user) {
            const amount = this.selectedCoverageAmount();
            if (policy.minCoverageAmount != null && amount < policy.minCoverageAmount) {
                this.notificationService.show(`Coverage amount must be at least ${policy.minCoverageAmount}`, 'error');
                return;
            }
            if (policy.maxCoverageAmount != null && amount > policy.maxCoverageAmount) {
                this.notificationService.show(`Coverage amount cannot exceed ${policy.maxCoverageAmount}`, 'error');
                return;
            }

            this.policyAppService.createApplication({
                userId: user.id,
                planId: policy.id!,
                businessProfileId: profile.id!,
                selectedCoverageAmount: this.selectedCoverageAmount(),
                paymentPlan: this.selectedPaymentPlan()
            }).subscribe({
                next: () => {
                    this.notificationService.show('Application submitted! Agent will review and approve your policy shortly.', 'success');
                    this.loadUserApplications();
                    this.closeModal();
                },
                error: (err) => {
                    this.notificationService.show(err.error?.message || 'Failed to submit application', 'error');
                }
            });
        }
    }
}
