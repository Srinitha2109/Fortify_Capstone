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
  templateUrl: './applications.html',
  styleUrl: './applications.css'
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
