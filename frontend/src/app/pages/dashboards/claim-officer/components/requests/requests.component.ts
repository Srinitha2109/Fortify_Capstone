import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
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
  documents?: ClaimDoc[];
  hovering?: boolean;
}

@Component({
  selector: 'app-claim-officer-requests',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex flex-col gap-8">
      <header class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-black text-slate-800 tracking-tight">Claim Requests</h1>
          <p class="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">Review and process your pending claims</p>
        </div>
        <button (click)="loadClaims()" class="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-600 hover:bg-burgundy hover:text-white transition-all shadow-sm group border-burgundy/10">
          <span class="group-hover:rotate-180 transition-transform duration-500 inline-block font-black text-burgundy group-hover:text-white">🔄</span> 
          Refresh List
        </button>
      </header>

      @if (isLoading()) {
      <div class="flex items-center justify-center py-24">
        <div class="w-10 h-10 border-4 border-burgundy border-t-transparent rounded-full animate-spin"></div>
      </div>
      } @else if (pendingClaims().length === 0) {
      <div class="flex flex-col items-center justify-center py-32 bg-white rounded-[2rem] border-2 border-dashed border-slate-200 gap-6">
        <span class="text-6xl grayscale opacity-30 text-burgundy">📂</span>
        <div class="text-center">
          <h3 class="text-xl font-black text-slate-700 mb-1">Queue Clear</h3>
          <p class="text-sm font-bold text-slate-400 uppercase tracking-widest">No new claims requiring your attention</p>
        </div>
      </div>
      } @else {
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
        @for (claim of pendingClaims(); track claim.id) {
        <div class="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group overflow-hidden">
          
          <!-- Card Header (Minimal) -->
          <div class="p-6 pb-2">
            <div class="flex items-center justify-between mb-2">
              <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Claim Reference</span>
              <span class="px-2 py-0.5 text-[8px] font-black uppercase rounded-full bg-pink/10 text-pink border border-pink/20">Pending Review</span>
            </div>
            <h2 class="text-xl font-black text-burgundy tracking-tight">{{ claim.claimNumber }}</h2>
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Application: <span class="text-burgundy/70">APP-{{ claim.policyApplicationId }}</span></p>
          </div>

          <!-- Description Section -->
          <div class="px-6 py-4 flex-1">
            <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Incident Description</span>
            <p class="text-sm font-medium text-slate-700 leading-relaxed">
              {{ claim.description }}
            </p>
          </div>

          <!-- Stats Grid -->
          <div class="px-6 py-4 grid grid-cols-2 gap-4 border-t border-slate-50">
            <div class="bg-burgundy/[0.02] p-3 rounded-2xl border border-burgundy/5">
              <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Requested Amount</span>
              <span class="text-sm font-black text-burgundy">{{ claim.claimAmount | currency }}</span>
            </div>
            <div class="bg-pink/[0.02] p-3 rounded-2xl border border-pink/5">
              <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Incident Date</span>
              <span class="text-sm font-black text-pink">{{ claim.incidentDate | date:'mediumDate' }}</span>
            </div>
          </div>

          <!-- Documents Area -->
          <div class="px-6 py-5 border-t border-slate-50">
            <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-3">Supporting Evidence</span>
            <div class="flex flex-wrap gap-2">
              @for (doc of claim.documents; track doc.id) {
              <button (click)="openDocument(doc)" 
                      class="flex items-center gap-2 px-3 py-2 bg-slate-50 hover:bg-burgundy/5 rounded-xl border border-slate-100 hover:border-burgundy/20 transition-all text-[10px] font-bold text-slate-600 hover:text-burgundy shadow-sm group/btn">
                <span>{{ getFileIcon(doc.fileType) }}</span>
                <span class="truncate max-w-[100px]">{{ doc.fileName }}</span>
                <span class="opacity-0 group-hover/btn:opacity-100 transition-opacity ml-1">⬇️</span>
              </button>
              } @empty {
                <span class="text-[10px] italic text-slate-400">No documents attached</span>
              }
            </div>
          </div>

          <!-- Actions -->
          <div class="p-6 pt-2 flex gap-3">
            <button (click)="approveClaim(claim)"
                    class="flex-1 py-3.5 bg-burgundy hover:bg-burgundy/90 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-burgundy/20 transition-all active:scale-95">
              Approve Claim
            </button>
            <button (click)="initiateRejection(claim)"
                    class="flex-1 py-3.5 bg-pink/5 border border-pink/20 hover:bg-pink/10 text-pink text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all active:scale-95">
              Reject
            </button>
          </div>
        </div>
        }
      </div>
      }

      <!-- Rejection Modal -->
      @if (showRejectionModal()) {
      <div class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
        <div class="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-300">
          <div class="px-8 py-8 border-b border-slate-100 flex items-center justify-between bg-burgundy/5">
            <div>
              <h2 class="text-2xl font-black text-burgundy tracking-tight">Reject Claim</h2>
              <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Review Reference: {{ selectedClaimForRejection()?.claimNumber }}</p>
            </div>
            <button (click)="showRejectionModal.set(false)" class="p-2 text-slate-400 hover:text-burgundy hover:bg-burgundy/5 rounded-full transition-all">
              <span class="text-2xl leading-none">×</span>
            </button>
          </div>
          
          <div class="p-8">
            <div class="space-y-6">
              <div class="p-4 bg-amber-50 rounded-2xl border border-amber-100/50">
                <p class="text-[10px] font-bold text-amber-700 leading-relaxed uppercase tracking-tight">
                  <span class="mr-1">⚠️</span> This action will notify the policyholder that their claim has been rejected.
                </p>
              </div>

              <div>
                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Reason for Rejection</label>
                <textarea 
                  [(ngModel)]="rejectionReason"
                  class="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-700 focus:ring-4 focus:ring-burgundy/10 focus:border-burgundy transition-all outline-none min-h-[140px] placeholder:text-slate-300 resize-none"
                  placeholder="Provide a professional explanation for the rejection..."></textarea>
              </div>

              <div class="flex gap-4">
                <button (click)="showRejectionModal.set(false)" 
                        class="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all active:scale-95">
                  Cancel
                </button>
                <button (click)="confirmRejection()"
                        [disabled]="!rejectionReason().trim()"
                        class="flex-1 py-4 bg-burgundy hover:bg-burgundy/90 disabled:opacity-50 disabled:cursor-not-allowed text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-burgundy/20 transition-all active:scale-95">
                  Submit Rejection
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      }
    </div>
  `
})
export class RequestsComponent implements OnInit {
  private authService = inject(AuthService);
  private http = inject(HttpClient);

  currentUser = this.authService.currentUser;
  pendingClaims = signal<ClaimItem[]>([]);
  isLoading = signal(true);
  officerId = signal<number | null>(null);

  // Rejection Modal State
  showRejectionModal = signal(false);
  rejectionReason = signal('');
  selectedClaimForRejection = signal<ClaimItem | null>(null);

  ngOnInit() {
    this.loadOfficerAndClaims();
  }

  loadOfficerAndClaims() {
    const user = this.currentUser();
    if (user?.id) {
      this.isLoading.set(true);
      this.http.get<any>(`/api/claim-officers/by-user/${user.id}`).subscribe({
        next: (officer) => {
          this.officerId.set(officer.id);
          this.loadClaims();
        },
        error: () => this.isLoading.set(false)
      });
    }
  }

  loadClaims() {
    const id = this.officerId();
    if (!id) return;
    this.isLoading.set(true);

    this.http.get<ClaimItem[]>(`/api/claims/claim-officer/${id}`).subscribe({
      next: (claims) => {
        const actionable = claims.filter(c =>
          c.status === 'SUBMITTED' || c.status === 'ASSIGNED' || c.status === 'UNDER_INVESTIGATION'
        ).map(c => ({ ...c, hovering: false }));
        actionable.sort((a, b) => new Date(b.incidentDate).getTime() - new Date(a.incidentDate).getTime());
        this.pendingClaims.set(actionable);

        actionable.forEach(claim => {
          this.http.get<ClaimDoc[]>(`/api/claim-documents/claim/${claim.id}`).subscribe({
            next: (docs) => {
              const updated = this.pendingClaims().map(c =>
                c.id === claim.id ? { ...c, documents: docs } : c
              );
              this.pendingClaims.set(updated);
            }
          });
        });

        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  approveClaim(claim: ClaimItem) {
    if (confirm('Are you confirm you want to APPROVE this claim?')) {
      this.http.put(`/api/claims/${claim.id}/approve`, {}).subscribe({
        next: () => this.loadClaims()
      });
    }
  }

  initiateRejection(claim: ClaimItem) {
    this.selectedClaimForRejection.set(claim);
    this.rejectionReason.set('');
    this.showRejectionModal.set(true);
  }

  confirmRejection() {
    const claim = this.selectedClaimForRejection();
    const reason = this.rejectionReason().trim();
    if (claim && reason) {
      this.http.put(`/api/claims/${claim.id}/reject?reason=${encodeURIComponent(reason)}`, {}).subscribe({
        next: () => {
          this.showRejectionModal.set(false);
          this.loadClaims();
        }
      });
    }
  }

  openDocument(doc: ClaimDoc) {
    this.http.get(`/api/documents/${doc.id}`, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => window.URL.revokeObjectURL(url), 10000);
      },
      error: () => alert('Could not open document. Please check if the file exists.')
    });
  }

  getFileIcon(fileType: string): string {
    if (!fileType) return '📄';
    if (fileType.includes('pdf')) return '📕';
    if (fileType.includes('image') || fileType.includes('png') || fileType.includes('jpg')) return '🖼️';
    return '📎';
  }
}
