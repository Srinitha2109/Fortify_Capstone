import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PolicyService, Policy } from '../../../../../services/policy';
import { NotificationService } from '../../../../../services/notification';

@Component({
  selector: 'app-admin-policies',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './policies.html',
  styleUrl: './policies.css'
})
export class PoliciesComponent implements OnInit {
  private policyService = inject(PolicyService);
  private notificationService = inject(NotificationService);

  policies = signal<Policy[]>([]);
  showPolicyForm = signal(false);
  isEditMode = signal(false);
  formSubmitted = signal(false);

  currentPolicy = signal<any>({
    policyNumber: '',
    policyName: '',
    insuranceType: '',
    description: '',
    minCoverageAmount: 0,
    maxCoverageAmount: 0,
    basePremium: 0,
    durationMonths: 12,
    isActive: true
  });

  searchQuery = signal('');
  filterStatus = signal<'all' | 'active' | 'inactive'>('all');
  filterType = signal<string | 'all'>('all');

  filteredPolicies = computed(() => {
    let list = this.policies();
    const query = this.searchQuery().toLowerCase();
    const status = this.filterStatus();
    const typeId = this.filterType();

    if (query) {
      list = list.filter(p => p.policyName.toLowerCase().includes(query) || p.policyNumber.toLowerCase().includes(query));
    }
    if (status !== 'all') {
      list = list.filter(p => p.isActive === (status === 'active'));
    }
    if (typeId !== 'all') {
      list = list.filter(p => p.insuranceType === typeId);
    }
    return list;
  });

  ngOnInit() {
    this.loadPolicies();
  }

  loadPolicies() {
    this.policyService.getAllPolicies().subscribe({
      next: (data) => this.policies.set(data),
      error: () => this.notificationService.show('Failed to load policies', 'error')
    });
  }

  openCreateForm() {
    this.isEditMode.set(false);
    this.resetForm();
    this.formSubmitted.set(false);
    this.showPolicyForm.set(true);
  }

  openEditForm(policy: Policy) {
    this.isEditMode.set(true);
    this.currentPolicy.set({ ...policy });
    this.formSubmitted.set(false);
    this.showPolicyForm.set(true);
  }

  savePolicy() {
    const policy = this.currentPolicy();
    if (!policy.policyName || !policy.insuranceType || !policy.durationMonths || !policy.basePremium) {
      this.formSubmitted.set(true);
      this.notificationService.show('Please fill all required fields correctly', 'warning');
      return;
    }

    if (this.isEditMode()) {
      this.policyService.updatePolicy(policy.id, policy).subscribe({
        next: () => {
          this.notificationService.show('Policy updated successfully!', 'success');
          this.showPolicyForm.set(false);
          this.loadPolicies();
        },
        error: () => this.notificationService.show('Failed to update policy', 'error')
      });
    } else {
      this.policyService.createPolicy(policy).subscribe({
        next: () => {
          this.notificationService.show('Policy created successfully!', 'success');
          this.showPolicyForm.set(false);
          this.loadPolicies();
        },
        error: () => this.notificationService.show('Failed to create policy', 'error')
      });
    }
  }

  resetForm() {
    this.currentPolicy.set({
      policyNumber: '',
      policyName: '',
      insuranceType: '',
      description: '',
      minCoverageAmount: 0,
      maxCoverageAmount: 0,
      basePremium: 0,
      durationMonths: 12,
      isActive: true
    });
  }
}
