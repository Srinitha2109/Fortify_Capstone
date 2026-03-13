import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PolicyApplicationService, PolicyApplication } from '../../../../services/policy-application';
import { PaymentService } from '../../../../services/payment';
import { AuthService } from '../../../../services/auth';
import { NotificationService } from '../../../../services/notification';
import { ClaimService, Claim } from '../../../../services/claim';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-policyholder-applications',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex flex-col gap-6 w-full max-w-7xl mx-auto p-3 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-3 flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-black text-burgundy tracking-tight">My Applications</h1>
          <p class="text-sm text-slate-500 font-bold  mt-1 tracking-tight">Track and manage your policy requests</p>
        </div>
        <div class="bg-burgundy/5 px-6 py-3 rounded-2xl border border-burgundy/10 shadow-sm">
          <span class="text-sm font-black text-burgundy">{{ applications().length }} Total Applications</span>
        </div>
      </div>
    
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        @for (app of applications(); track app.id) {
          <div class="bg-white rounded-xl border border-slate-100 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col group">
            <!-- Status Header — light burgundy -->
            <div class="px-5 py-3 flex items-center justify-between"
              style=" border-bottom: 1px solid #C17B8C30;">
              <span class="text-[10px] font-black uppercase tracking-widest" style="color: #8B1A3A;">{{ app.policyNumber }}</span>
              <span class="px-2.5 py-0.5 text-[9px] font-black uppercase rounded-md"
              style="background: #C17B8C30; color: #8B1A3A;">{{ app.status }}</span>
            </div>
    
            <div class="p-5 flex-1 flex flex-col gap-4">
              <!-- Plan Name -->
              <div>
                <h3 class="text-sm font-black text-slate-800 leading-tight uppercase tracking-tight group-hover:text-[#8B1A3A] transition-colors">
                  {{ app.planName || 'Insurance Plan' }}
                </h3>
                <p class="text-[10px] font-semibold text-slate-400 uppercase mt-0.5">{{ app.paymentPlan }} Plan</p>
              </div>
    
              <!-- Coverage & Premium inline -->
              <div class="grid grid-cols-2 gap-3">
                <div class="bg-[#F9F0F3] p-3 rounded-lg">
                  <span class="block text-[8px] font-black uppercase text-[#8B1A3A]/50 tracking-widest mb-0.5">Coverage Balance</span>
                  <span class="text-sm font-black text-[#8B1A3A]">{{ getAvailableBalance(app) }}</span>
                  <p class="text-[8px] font-bold text-slate-400 mt-0.5 uppercase tracking-tighter">Limit: {{ app.selectedCoverageAmount  }}</p>
                </div>
                <div class="bg-[#F9F0F3] p-3 rounded-lg">
                  <span class="block text-[8px] font-black uppercase text-[#8B1A3A]/50 tracking-widest mb-0.5">Premium</span>
                  <span class="text-sm font-black text-[#8B1A3A]">{{ app.premiumAmount  }}</span>
                </div>
              </div>
    
              <!-- Dates -->
              <div class="flex flex-col gap-1.5">
                <div class="flex justify-between items-center">
                  <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Expiry</span>
                  <span class="text-[10px] font-bold text-slate-600">{{ (app.endDate | date:'mediumDate') || 'TMy BD' }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Next Due</span>
                  <span class="text-[10px] font-bold text-slate-600">{{ app.nextPaymentDueDate ? (app.nextPaymentDueDate | date:'mediumDate') : 'Pending' }}</span>
                </div>
              </div>
    
              <!-- Action Buttons -->
              <div class="flex flex-col gap-2 mt-auto">
                @if (isPaymentRequired(app)) {
                  <button (click)="payPremium(app)"
                    class="w-full py-2.5 text-white text-xs font-black rounded-lg transition-all flex items-center justify-center gap-2"
                    style="background: #8B1A3A;">
                    Pay Premium
                  </button>
                } @else if (app.status === 'ACTIVE') {
                  <button class="w-full py-2.5 bg-emerald-50 text-emerald-600 border border-emerald-100 text-xs font-black rounded-lg flex items-center justify-center gap-2 cursor-default">
                    Paid
                  </button>
                  @if (getAvailableBalance(app) > 0) {
                    <button (click)="openClaimModal(app)"
                      class="w-full py-2.5 text-xs font-black rounded-lg flex items-center justify-center gap-2 transition-all"
                      style="background: #C17B8C20; color: #8B1A3A; border: 1px solid #C17B8C40;"
                      onmouseover="this.style.background='#8B1A3A';this.style.color='white'"
                      onmouseout="this.style.background='#C17B8C20';this.style.color='#8B1A3A'">
                      Raise Claim
                    </button>
                  } @else {
                    <div class="w-full py-2.5 bg-rose-50 border border-rose-100 text-rose-400 text-xs font-black rounded-lg flex items-center justify-center gap-2">
                      Coverage Limit Reached
                    </div>
                  }
                } @else if (app.status === 'REJECTED') {
                  <div class="bg-rose-50 p-3 rounded-lg border border-rose-100">
                    <span class="block text-[8px] font-black uppercase text-rose-400 mb-0.5 tracking-widest">Reason</span>
                    <p class="text-[10px] font-semibold text-rose-600 italic leading-snug">"{{ app.rejectionReason || 'No reason provided' }}"</p>
                  </div>
                } @else {
                  <div class="flex items-center justify-center gap-2 py-2.5 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                    <div class="w-1.5 h-1.5 rounded-full bg-[#8B1A3A]/30 animate-bounce" style="animation-delay: 0ms"></div>
                    <div class="w-1.5 h-1.5 rounded-full bg-[#8B1A3A]/50 animate-bounce" style="animation-delay: 150ms"></div>
                    <div class="w-1.5 h-1.5 rounded-full bg-[#8B1A3A]/70 animate-bounce" style="animation-delay: 300ms"></div>
                    <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Under Review</span>
                  </div>
                }
              </div>
            </div>
          </div>
          } @empty {
          <div class="col-span-full py-20 flex flex-col items-center justify-center bg-white rounded-xl border-2 border-dashed border-slate-200 gap-4">
            <div class="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-4xl opacity-50"></div>
            <div class="text-center">
              <h3 class="text-lg font-black text-slate-700 mb-1">No Applications</h3>
              <p class="text-slate-400 text-xs font-semibold">Browse available policies to get started.</p>
            </div>
          </div>
        }
      </div>
    </div>
    
    <!-- Raise Claim Modal -->
    @if (showClaimModal()) {
      <div class="fixed inset-0 bg-slate-800/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden">
          <!-- Modal Header -->
          <div class="px-8 py-6 border-b border-slate-100 flex justify-between items-start">
            <div>
              <h2 class="text-xl font-black text-slate-800">Raise a Claim</h2>
              <p class="text-xs text-slate-400 font-semibold mt-0.5">Application ID: <span class="font-black text-burgundy">#{{ selectedApp()?.id }}</span></p>
            </div>
            <button (click)="closeClaimModal()" class="text-slate-400 hover:text-slate-600 transition-colors text-xl leading-none">✕</button>
          </div>
    
          <!-- Available Balance Banner -->
          <div class="mx-8 mt-6 p-4 rounded-xl flex items-center justify-between"
            [ngClass]="getAvailableBalance(selectedApp()!) > 0 ? 'bg-emerald-50 border border-emerald-100' : 'bg-rose-50 border border-rose-100'">
            <div>
              <span class="text-[10px] font-black uppercase tracking-widest"
              [ngClass]="getAvailableBalance(selectedApp()!) > 0 ? 'text-emerald-500' : 'text-rose-400'">Coverage Balance Available</span>
              <p class="text-base font-black mt-0.5"
                [ngClass]="getAvailableBalance(selectedApp()!) > 0 ? 'text-emerald-700' : 'text-rose-600'">
                {{ getAvailableBalance(selectedApp()!)  }}
              </p>
            </div>
            <div class="text-right">
              <span class="text-[10px] font-black uppercase tracking-widest text-slate-400">Coverage Limit</span>
              <p class="text-sm font-black text-slate-600">{{ selectedApp()?.selectedCoverageAmount  }}</p>
    
            </div>
          </div>
    
          <div class="px-8 pt-6 pb-8 space-y-5">
            <div class="grid grid-cols-2 gap-5">
                  <div class="space-y-1.5">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Date of Incident</label>
                    <input type="date" [(ngModel)]="claimForm.incidentDate" name="incidentDate" #date="ngModel"
                      [max]="todayDate()"
                      class="form-control w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-semibold text-sm text-slate-700"
                      [ngClass]="{'is-invalid': (date.touched || formSubmitted()) && !claimForm.incidentDate}">
                    @if ((date.touched || formSubmitted()) && !claimForm.incidentDate) {
                      <div class="error-msg">Date is required</div>
                    }
                  </div>
                  <div class="space-y-1.5">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Incident Location</label>
                    <input type="text" [(ngModel)]="claimForm.incidentLocation" name="location" #loc="ngModel" placeholder="e.g. Hyderabad"
                      class="form-control w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-semibold text-sm text-slate-700 placeholder:text-slate-300"
                      [ngClass]="{'is-invalid': (loc.touched || formSubmitted()) && !claimForm.incidentLocation}">
                    @if ((loc.touched || formSubmitted()) && !claimForm.incidentLocation) {
                      <div class="error-msg">Location is required</div>
                    }
                  </div>
                </div>
    
                <div class="space-y-1.5">
                  <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Description of Incident</label>
                  <textarea [(ngModel)]="claimForm.description" name="desc" #desc="ngModel" rows="4" placeholder="Describe what happened in detail..."
                    class="form-control w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-semibold text-sm text-slate-700 placeholder:text-slate-300 resize-none"
                    [ngClass]="{'is-invalid': (desc.touched || formSubmitted()) && !claimForm.description}"></textarea>
                  @if ((desc.touched || formSubmitted()) && !claimForm.description) {
                    <div class="error-msg">Description is required</div>
                  }
                </div>
    
                <div class="grid grid-cols-2 gap-5">
                  <div class="space-y-1.5">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Estimated Claim Amount</label>
                    <input type="number" [(ngModel)]="claimForm.claimAmount" name="amount" #amt="ngModel" min="1"
                      [max]="getAvailableBalance(selectedApp()!)"
                      class="form-control w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-semibold text-sm text-slate-700"
                      [ngClass]="{'is-invalid': (amt.touched || formSubmitted()) && (claimForm.claimAmount <= 0 || claimForm.claimAmount > getAvailableBalance(selectedApp()!))}">
                    @if ((amt.touched || formSubmitted()) && claimForm.claimAmount <= 0) {
                      <div class="error-msg">Please enter a valid amount</div>
                    }
                    @if ((amt.touched || formSubmitted()) && claimForm.claimAmount > getAvailableBalance(selectedApp()!)) {
                      <div class="error-msg">Exceeds available balance of {{ getAvailableBalance(selectedApp()!) }}</div>
                    }
                  </div>
                  <div class="space-y-1.5">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Upload Documents</label>
                    <div class="relative">
                      <input type="file" (change)="onFileSelected($event)" multiple class="absolute inset-0 opacity-0 cursor-pointer">
                      <div class="w-full px-4 py-3 bg-white border-2 border-dashed border-slate-200 rounded-xl text-center">
                        <p class="text-[10px] font-black text-slate-400 uppercase">
                          {{ selectedFiles.length > 0 ? selectedFiles.length + ' file(s) selected' : '📎 Click to upload proof' }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
    
                  <div class="flex gap-4 pt-2">
                    <button (click)="closeClaimModal()" class="flex-1 py-3.5 border border-slate-200 rounded-xl font-black text-sm text-slate-500 hover:bg-slate-50 transition-colors">Cancel</button>
                    <button (click)="submitClaim()"
                      [disabled]="isSubmitting() || claimForm.claimAmount <= 0 || claimForm.claimAmount > getAvailableBalance(selectedApp()!)"
                      class="flex-[2] py-3.5 bg-burgundy text-white rounded-xl font-black text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed">
                      {{ isSubmitting() ? 'Submitting...' : 'Submit Claim' }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          }
    `,
  styles: [`
    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; }
  `]
})
export class ApplicationsComponent implements OnInit {
  private policyAppService = inject(PolicyApplicationService);
  private authService = inject(AuthService);
  private paymentService = inject(PaymentService);
  private notificationService = inject(NotificationService);
  private claimService = inject(ClaimService);

  applications = signal<PolicyApplication[]>([]);
  isLoading = signal(true);
  isSubmitting = signal(false);
  formSubmitted = signal(false);

  // Claim Modal State
  showClaimModal = signal(false);
  selectedApp = signal<PolicyApplication | null>(null);
  selectedFiles: File[] = [];
  claimForm = {
    incidentDate: '',
    incidentLocation: '',
    description: '',
    claimAmount: 0
  };

  todayDate = signal<string>(new Date().toISOString().split('T')[0]);

  ngOnInit() {
    this.loadApplications();
  }

  loadApplications() {
    const user = this.authService.currentUser();
    if (user && user.id) {
      this.policyAppService.getApplicationsByUserId(user.id).subscribe({
        next: (apps) => {
          this.applications.set(apps);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false)
      });
    }
  }

  getStatusBg(status: string | undefined): string {
    switch (status) {
      case 'ACTIVE': return 'bg-burgundy';
      case 'APPROVED': return 'bg-burgundy/100';
      case 'REJECTED': return 'bg-rose-600';
      case 'SUBMITTED': return 'bg-burgundy/40';
      case 'UNDER_REVIEW': return 'bg-burgundy/60';
      default: return 'bg-slate-400';
    }
  }

  //checks if payment button should be active or not

  isPaymentRequired(app: PolicyApplication): boolean {
    if (!app.status) return false;
    if (app.status === 'APPROVED') return true;
    if (app.status === 'ACTIVE') {
      if (!app.nextPaymentDueDate) return false;
      const dueDate = new Date(app.nextPaymentDueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      dueDate.setHours(0, 0, 0, 0);
      return today >= dueDate;
    }
    return false;
  }

  //it is called when policyholder clicks on pay premium button
  payPremium(app: PolicyApplication) {
    if (!app.id || !app.premiumAmount) return;

    this.paymentService.createPayment({
      policyApplicationId: app.id,
      amount: app.premiumAmount,
      paymentMethod: 'CARD',
      paymentType: 'PREMIUM'
    }).subscribe({
      next: () => {
        this.notificationService.show('Payment Done! Your policy is now ACTIVE.', 'success');
        this.loadApplications();
      },
      error: () => this.notificationService.show('Payment failed. Please try again.', 'error')
    });
  }

  getAvailableBalance(app: PolicyApplication): number {
    if (!app || !app.selectedCoverageAmount) return 0;
    const settled = app.totalSettledAmount ?? 0;
    const available = (app.selectedCoverageAmount as number) - (settled as number);
    return available > 0 ? available : 0;
  }

  //when user clicks raise claim button
  openClaimModal(app: PolicyApplication) {
    this.selectedApp.set(app);
    this.showClaimModal.set(true);
    const today = new Date().toISOString().split('T')[0];
    this.todayDate.set(today);
    this.claimForm = {
      incidentDate: today,
      incidentLocation: '',
      description: '',
      claimAmount: 0
    };
    this.selectedFiles = [];
    this.formSubmitted.set(false);
  }

  closeClaimModal() {
    this.showClaimModal.set(false);
    this.selectedApp.set(null);
  }

  onFileSelected(event: any) {
    if (event.target.files) {
      this.selectedFiles = Array.from(event.target.files);
    }
  }

  submitClaim() {
    const app = this.selectedApp();
    if (!app || !app.id) return;

    if (!this.claimForm.incidentDate || !this.claimForm.incidentLocation || !this.claimForm.description || this.claimForm.claimAmount <= 0) {
      this.formSubmitted.set(true);
      this.notificationService.show('Please fill all required fields correctly.', 'error');
      return;
    }

    this.isSubmitting.set(true);

    const claimData: Claim = {
      policyApplicationId: app.id,
      description: this.claimForm.description,
      claimAmount: this.claimForm.claimAmount,
      incidentDate: this.claimForm.incidentDate,
      incidentLocation: this.claimForm.incidentLocation
    };

    this.claimService.createClaim(claimData, this.selectedFiles).subscribe({
      next: () => {
        this.notificationService.show('Claim submitted successfully! Our officer will contact you.', 'success');
        this.isSubmitting.set(false);
        this.closeClaimModal();
      },
      error: (err) => {
        console.error('Claim error:', err);
        this.notificationService.show('Failed to submit claim. Please try again.', 'error');
        this.isSubmitting.set(false);
      }
    });
  }
}
