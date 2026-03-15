import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PolicyApplicationService, PolicyApplication } from '../../../../../services/policy-application';
import { AuthService } from '../../../../../services/auth';
import { NotificationService } from '../../../../../services/notification';

@Component({
  selector: 'app-agent-requests',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './requests.html',
  styleUrl: './requests.css'
})
export class RequestsComponent implements OnInit {
  private policyAppService = inject(PolicyApplicationService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  requests = signal<PolicyApplication[]>([]);
  selectedReq = signal<PolicyApplication | null>(null);
  isRejecting = signal(false);
  rejectionReason = '';

  pendingCount = computed(() => this.requests().filter(r => r.status === 'SUBMITTED' || r.status === 'UNDER_REVIEW').length);

  ngOnInit() {
    this.loadRequests();
  }

  loadRequests() {
    const user = this.authService.currentUser();
    if (user && user.id) {
      this.policyAppService.getApplicationsByAgentId(user.id).subscribe({
        next: (apps) => this.requests.set(apps),
        error: () => this.notificationService.show('Failed to load requests', 'error')
      });
    }
  }

  openReview(req: PolicyApplication) {
    this.selectedReq.set(req);
    this.isRejecting.set(false);
    this.rejectionReason = '';
  }

  closeReview() {
    this.selectedReq.set(null);
  }

  approve() {
    const req = this.selectedReq();
    if (req && req.id) {
      this.policyAppService.approveApplication(req.id).subscribe({
        next: () => {
          this.notificationService.show('Application approved successfully!', 'success');
          this.loadRequests();
          this.closeReview();
        },
        error: (err) => this.notificationService.show(err.error?.message || 'Approval failed', 'error')
      });
    }
  }

  confirmReject() {
    const req = this.selectedReq();
    if (req && req.id && this.rejectionReason) {
      this.policyAppService.rejectApplication(req.id, this.rejectionReason).subscribe({
        next: () => {
          this.notificationService.show('Application rejected.', 'info');
          this.loadRequests();
          this.closeReview();
        },
        error: () => this.notificationService.show('Rejection failed', 'error')
      });
    }
  }
}
