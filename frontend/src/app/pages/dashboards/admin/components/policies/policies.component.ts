import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PolicyService, Policy } from '../../../../../services/policy';
import { NotificationService } from '../../../../../services/notification';

@Component({
    selector: 'app-admin-policies',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="space-y-6">
        @if (!showPolicyForm()) {
        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-300">
            <div class="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                <h2 class="text-lg font-extrabold text-burgundy tracking-tight">Insurance Policies</h2>
                <button (click)="openCreateForm()"
                    class="px-5 py-2 bg-burgundy text-white text-sm font-black rounded-xl hover:bg-burgundy-secondary transition-all shadow-md hover:shadow-burgundy/20">
                    + Create Policy
                </button>
            </div>

            <!-- Filter Bar -->
            <div class="p-6 bg-white border-b border-slate-100 flex flex-wrap gap-4 items-center">
                <div class="relative flex-1 min-w-[300px]">
                    
                    <input type="text" placeholder="Search policies by name or number..."
                        class="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-pink/10 focus:border-pink transition-all"
                        [ngModel]="searchQuery()" (ngModelChange)="searchQuery.set($event)">
                </div>
                <div class="flex gap-3">
                    <select
                        class="px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-burgundy/5"
                        [ngModel]="filterType()" (ngModelChange)="filterType.set($event)">
                        <option value="all">All Types</option>
                        <option value="GENERAL_LIABILITY">General Liability</option>
                        <option value="AUTO">Auto</option>
                        <option value="WORKERS_COMPENSATION">Workers compensation</option>
                    </select>
                    <select
                        class="px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-burgundy/5"
                        [ngModel]="filterStatus()" (ngModelChange)="filterStatus.set($event)">
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>
            </div>

            <div class="overflow-x-auto">
                <table class="w-full border-collapse">
                    <thead>
                        <tr class="bg-slate-50 border-b border-slate-100">
                            <th class="px-6 py-4 text-left text-[10px] font-black text-burgundy uppercase tracking-widest">Policy No.</th>
                            <th class="px-6 py-4 text-left text-[10px] font-black text-burgundy uppercase tracking-widest">Policy Name</th>
                            <th class="px-6 py-4 text-left text-[10px] font-black text-burgundy uppercase tracking-widest">Type</th>
                            <th class="px-6 py-4 text-left text-[10px] font-black text-burgundy uppercase tracking-widest">Coverage Range</th>
                            <th class="px-6 py-4 text-left text-[10px] font-black text-burgundy uppercase tracking-widest">Premium</th>
                            <th class="px-6 py-4 text-left text-[10px] font-black text-burgundy uppercase tracking-widest">Status</th>
                            <th class="px-6 py-4 text-left text-[10px] font-black text-burgundy uppercase tracking-widest">Action</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                        @for (policy of filteredPolicies(); track policy.id) {
                        <tr class="hover:bg-slate-50/50 transition-colors group">
                            <td class="px-6 py-5">
                                <span class="px-2.5 py-1 bg-slate-100 text-slate-600 font-mono text-xs font-bold rounded-md">{{ policy.policyNumber }}</span>
                            </td>
                            <td class="px-6 py-5 text-sm font-black text-slate-800">{{ policy.policyName }}</td>
                            <td class="px-6 py-5 text-sm text-slate-600 font-medium">{{ policy.insuranceTypeDisplayName }}</td>
                            <td class="px-6 py-5 text-sm font-semibold text-slate-700">
                                {{ policy.minCoverageAmount | currency }} - {{ policy.maxCoverageAmount | currency }}
                            </td>
                            <td class="px-6 py-5 text-sm font-black text-burgundy">{{ policy.basePremium | currency }}</td>
                            <td class="px-6 py-5">
                                <span class="px-3 py-1 text-[10px] font-black uppercase rounded-full"
                                    [class.bg-green-100]="policy.isActive"
                                    [class.text-green-700]="policy.isActive"
                                    [class.bg-red-100]="!policy.isActive"
                                    [class.text-red-700]="!policy.isActive">
                                    {{ policy.isActive ? 'Active' : 'Inactive' }}
                                </span>
                            </td>
                            <td class="px-6 py-5">
                                <button (click)="openEditForm(policy)"
                                    class="text-pink hover:text-burgundy font-black text-[11px] uppercase tracking-tighter transition-colors">Edit</button>
                            </td>
                        </tr>
                        } @empty {
                        <tr>
                            <td colspan="7" class="px-6 py-20 text-center">
                                <div class="flex flex-col items-center gap-2 opacity-40">
                                    <p class="font-bold text-slate-500">No policies matching your criteria.</p>
                                </div>
                            </td>
                        </tr>
                        }
                    </tbody>
                </table>
            </div>
        </div>
        } @else {
        <!-- Policy Form (Create/Edit) -->
        <div class="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div class="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-burgundy/5">
                <div>
                    <h2 class="text-xl font-black text-burgundy tracking-tight">{{ isEditMode() ? 'Edit Policy' : 'Create New Policy' }}</h2>
                    <p class="text-xs text-slate-500 font-bold uppercase mt-1">{{ isEditMode() ? 'Update production configuration' : 'Configure fresh insurance product' }}</p>
                </div>
                <button (click)="showPolicyForm.set(false)" class="p-2 text-slate-400 hover:text-red-500 transition-colors">
                    <span class="text-2xl">✕</span>
                </button>
            </div>

            <form (submit)="savePolicy()" class="p-10">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                    <div class="space-y-2">
                        <label class="text-[11px] font-black text-burgundy uppercase tracking-widest pl-1">Policy Name*</label>
                        <input type="text" [(ngModel)]="currentPolicy().policyName" name="policyName" #policyName="ngModel"
                            placeholder="e.g. Comprehensive Business Fire" required
                            class="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-burgundy/5 focus:border-burgundy focus:bg-white transition-all outline-none"
                            [ngClass]="{'is-invalid': (policyName.touched || formSubmitted()) && !currentPolicy().policyName}">
                        <div class="error-msg" *ngIf="(policyName.touched || formSubmitted()) && !currentPolicy().policyName">Policy name is required</div>
                    </div>

                    <div class="space-y-2">
                        <label class="text-[11px] font-black text-burgundy uppercase tracking-widest pl-1">Insurance Type*</label>
                        <select [(ngModel)]="currentPolicy().insuranceType" name="insuranceType" #insType="ngModel" required
                            class="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-burgundy/5 focus:border-burgundy focus:bg-white transition-all outline-none font-bold"
                            [ngClass]="{'is-invalid': (insType.touched || formSubmitted()) && !currentPolicy().insuranceType}">
                            <option value="" disabled>Select Type</option>
                            <option value="GENERAL_LIABILITY">General Liability</option>
                            <option value="AUTO">Auto</option>
                            <option value="WORKERS_COMPENSATION">Workers compensation</option>
                        </select>
                        <div class="error-msg" *ngIf="(insType.touched || formSubmitted()) && !currentPolicy().insuranceType">Select an insurance type</div>
                    </div>

                    <div class="space-y-2">
                        <label class="text-[11px] font-black text-burgundy uppercase tracking-widest pl-1">Duration (Months)*</label>
                        <input type="number" [(ngModel)]="currentPolicy().durationMonths" name="duration" #duration="ngModel" required
                            class="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-burgundy/5 focus:border-burgundy focus:bg-white transition-all outline-none"
                            [ngClass]="{'is-invalid': (duration.touched || formSubmitted()) && !currentPolicy().durationMonths}">
                        <div class="error-msg" *ngIf="(duration.touched || formSubmitted()) && !currentPolicy().durationMonths">Duration is required</div>
                    </div>

                    <div class="space-y-2">
                        <label class="text-[11px] font-black text-burgundy uppercase tracking-widest pl-1">Base Premium*</label>
                        <div class="relative">
                            <input type="number" [(ngModel)]="currentPolicy().basePremium" name="premium" #premium="ngModel" required
                                class="w-full pl-10 pr-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-burgundy/5 focus:border-burgundy focus:bg-white transition-all outline-none"
                                [ngClass]="{'is-invalid': (premium.touched || formSubmitted()) && !currentPolicy().basePremium}">
                        </div>
                        <div class="error-msg" *ngIf="(premium.touched || formSubmitted()) && !currentPolicy().basePremium">Premium is required</div>
                    </div>

                    <div class="space-y-2">
                         <label class="text-[11px] font-black text-burgundy uppercase tracking-widest pl-1">Min Coverage Amount*</label>
                         <div class="relative">
                             <input type="number" [(ngModel)]="currentPolicy().minCoverageAmount" name="minCoverage" #minC="ngModel" required
                                 class="w-full pl-10 pr-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-burgundy/5 focus:border-burgundy focus:bg-white transition-all outline-none"
                                 [ngClass]="{'is-invalid': (minC.touched || formSubmitted()) && !currentPolicy().minCoverageAmount}">
                         </div>
                         <div class="error-msg" *ngIf="(minC.touched || formSubmitted()) && !currentPolicy().minCoverageAmount">Min amount is required</div>
                     </div>

                     <div class="space-y-2">
                         <label class="text-[11px] font-black text-burgundy uppercase tracking-widest pl-1">Max Coverage Amount*</label>
                         <div class="relative">
                             <input type="number" [(ngModel)]="currentPolicy().maxCoverageAmount" name="maxCoverage" #maxC="ngModel" required
                                 class="w-full pl-10 pr-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-burgundy/5 focus:border-burgundy focus:bg-white transition-all outline-none"
                                 [ngClass]="{'is-invalid': (maxC.touched || formSubmitted()) && !currentPolicy().maxCoverageAmount}">
                         </div>
                         <div class="error-msg" *ngIf="(maxC.touched || formSubmitted()) && !currentPolicy().maxCoverageAmount">Max amount is required</div>
                     </div>

                    <div class="md:col-span-2 space-y-2">
                        <label class="text-[11px] font-black text-burgundy uppercase tracking-widest pl-1">Detailed Description</label>
                        <textarea rows="4" [(ngModel)]="currentPolicy().description" name="description"
                            placeholder="Define policy inclusions, exclusions and key terms..."
                            class="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-burgundy/5 focus:border-burgundy focus:bg-white transition-all outline-none resize-none"></textarea>
                    </div>

                    <div class="flex items-center gap-3">
                        <input type="checkbox" [(ngModel)]="currentPolicy().isActive" name="active" id="policyActive"
                            class="w-6 h-6 rounded-lg text-pink border-slate-300 focus:ring-pink">
                        <label for="policyActive" class="text-sm font-black text-slate-700 cursor-pointer">Active Policy</label>
                    </div>
                </div>

                <div class="mt-12 flex gap-4 border-t border-slate-100 pt-8">
                    <button type="submit"
                        class="px-8 py-4 bg-burgundy text-white font-black rounded-2xl shadow-xl shadow-burgundy/20 hover:bg-burgundy-secondary hover:-translate-y-1 active:translate-y-0 transition-all">
                        {{ isEditMode() ? 'Update Policy' : 'Process & Save Policy' }}
                    </button>
                    <button type="button" (click)="showPolicyForm.set(false)"
                        class="px-8 py-4 bg-white border border-slate-200 text-slate-600 font-black rounded-2xl hover:bg-slate-50 transition-all">
                        Discard Changes
                    </button>
                </div>
            </form>
        </div>
        }
    </div>
  `,
    styles: `
    .error-msg {
        color: red;
        font-size: 12px;
        margin-top: 5px;
    }
    `
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
