import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../../../../services/auth';

interface ClaimDoc {
  id: number;
  fileName: string;
  filePath: string;
  fileType: string;
}

interface ClaimItem {
  id: number;
  claimNumber: string;
  policyApplicationId: number;
  policyNumber?: string;
  description: string;
  claimAmount: number;
  incidentDate: string;
  incidentLocation: string;
  status: string;
  policyholderName?: string;
}


@Component({
  selector: 'app-claim-officer-overview',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col gap-8">
      <header>
        <h1 class="text-3xl font-black text-slate-800 tracking-tight">Claims Overview</h1>
        <p class="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">Summary and history of your assigned claims</p>
      </header>

      @if (isLoading()) {
      <div class="flex items-center justify-center py-20">
        <div class="w-8 h-8 border-4 border-[#8B1A3A] border-t-transparent rounded-full animate-spin"></div>
      </div>
      } @else {
      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
          <span class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Total Assigned</span>
          <span class="text-4xl font-black text-slate-800">{{ allClaims().length }}</span>
        </div>
        <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
          <span class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Pending Requests</span>
          <span class="text-4xl font-black text-amber-500">{{ pendingCount() }}</span>
        </div>
        <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
          <span class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Approved Claims</span>
          <span class="text-4xl font-black text-emerald-500">{{ approvedCount() }}</span>
        </div>
        <div class="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col relative overflow-hidden group hover:border-slate-300 transition-colors">
          <span class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Total Payouts Approved</span>
          <span class="text-3xl font-black text-slate-800">{{ totalPayouts() | currency }}</span>
          <div class="absolute -right-4 -bottom-4 text-4xl opacity-5 group-hover:opacity-10 transition-opacity">💵</div>
        </div>
      </div>

      <!-- Simplified All Claims Table -->
      <section class="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mt-8">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50/50 border-b border-slate-100">
                <th class="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Claim ID</th>
                <th class="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Policyholder</th>
                <th class="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Incident Date</th>
                <th class="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Description</th>
                <th class="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right pr-12">Amount</th>
                <th class="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                <th class="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Actions</th>

              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              @for (claim of allClaims(); track claim.id) {
              <tr class="hover:bg-slate-50/50 transition-colors group">
                <td class="px-8 py-5">
                  <span class="text-xs font-black text-slate-800 hover:text-blue-600 transition-colors cursor-pointer" (click)="inspectClaim(claim.id)">
                    {{ claim.claimNumber }}
                  </span>
                </td>
                <td class="px-8 py-5">
                  
                  <p class="text-[9px] text-slate-400 font-black uppercase tracking-tighter">APP-{{ claim.policyApplicationId }}</p>
                </td>
                
                <td class="px-8 py-5 text-xs font-bold text-slate-500">{{ claim.incidentDate | date:'mediumDate' }}</td>
                <td class="px-8 py-5">
                  <p class="text-xs font-medium text-slate-500 line-clamp-1 max-w-[200px]" [title]="claim.description">
                    {{ claim.description }}
                  </p>
                </td>

                <td class="px-8 py-5 text-sm font-black text-slate-800 text-right pr-12">
                  {{ claim.claimAmount | currency }}
                </td>
                <td class="px-8 py-5">
                  <span [ngClass]="getStatusClass(claim.status)"
                        class="px-2.5 py-1 text-[8px] font-black uppercase rounded-lg border inline-block min-w-[80px] text-center">
                    {{ claim.status }}
                  </span>
                </td>
                <td class="px-8 py-5">
                  <div class="flex items-center justify-center gap-2">
                    <button (click)="openDocument(claim.id)" 
                            class="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all" 
                            >
                      <span class="text-base bg-green-500  rounded-lg px-2 py-1 cursor-pointer  text-black">Documents</span>
                    </button>
                    <button (click)="inspectClaim(claim.id)"
                            class="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                            >
                      <span class="text-base bg-green-500 px-2 py-1 rounded-lg text-black cursor-pointer">Inspect</span>
                    </button>
                  </div>
                </td>
              </tr>
              } @empty {
              <tr>
                <td colspan="7" class="py-32 text-center">
                  <div class="flex flex-col items-center justify-center">
                    <span class="text-5xl opacity-20 mb-4">📄</span>
                    <h3 class="text-lg font-black text-slate-700">No Claims Assigned</h3>
                    <p class="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">You currently have no claims in your portfolio</p>
                  </div>
                </td>
              </tr>
              }
            </tbody>
          </table>
        </div>
      </section>
      }
    </div>

  `,
  styles: [`
    .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .line-clamp-none { display: block; }
  `]
})
export class OverviewComponent implements OnInit {
  private authService = inject(AuthService);
  private http = inject(HttpClient);
  private router = inject(Router);

  currentUser = this.authService.currentUser;
  allClaims = signal<ClaimItem[]>([]);
  isLoading = signal(true);

  pendingCount = signal(0);
  approvedCount = signal(0);
  totalPayouts = signal(0);

  ngOnInit() {
    const user = this.currentUser();
    if (user?.id) {
      this.http.get<any>(`/api/claim-officers/by-user/${user.id}`).subscribe({
        next: (officer) => this.loadClaims(officer.id),
        error: () => this.isLoading.set(false)
      });
    }
  }

  loadClaims(officerId: number) {
    this.http.get<ClaimItem[]>(`/api/claims/claim-officer/${officerId}`).subscribe({
      next: (claims) => {
        const claimsWithState = claims.map(c => ({ ...c, hovering: false }));
        // Sort newest first
        claimsWithState.sort((a, b) => new Date(b.incidentDate).getTime() - new Date(a.incidentDate).getTime());

        this.allClaims.set(claimsWithState);

        let pending = 0;
        let approved = 0;
        let payouts = 0;

        claims.forEach(c => {
          if (c.status === 'SUBMITTED' || c.status === 'ASSIGNED' || c.status === 'UNDER_INVESTIGATION') pending++;
          if (c.status === 'APPROVED' || c.status === 'SETTLED') {
            approved++;
            payouts += c.claimAmount;
          }
        });

        this.pendingCount.set(pending);
        this.approvedCount.set(approved);
        this.totalPayouts.set(payouts);

        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  openDocument(claimId: number) {
    this.http.get<ClaimDoc[]>(`/api/claim-documents/claim/${claimId}`).subscribe({
      next: (docs) => {
        if (docs && docs.length > 0) {
          docs.forEach(doc => {
            this.http.get(`/api/documents/${doc.id}`, { responseType: 'blob' }).subscribe({
              next: (blob) => {
                const url = window.URL.createObjectURL(blob);
                window.open(url, '_blank');
                setTimeout(() => window.URL.revokeObjectURL(url), 10000);
              }
            });
          });
        } else {
          alert('No documents found for this claim.');
        }
      }
    });
  }

  inspectClaim(claimId: number) {
    this.router.navigate(['/claim-officer/requests']);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'APPROVED': case 'SETTLED': return 'bg-emerald-50 border-emerald-100 text-emerald-600';
      case 'REJECTED': return 'bg-rose-50 border-rose-100 text-rose-500';
      default: return 'bg-amber-50 border-amber-100 text-amber-600';
    }
  }
}
