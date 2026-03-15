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
  policyholderName?: string;
  planName?: string;
  documents?: ClaimDoc[];
  hovering?: boolean;
}


@Component({
  selector: 'app-claim-officer-requests',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './requests.html',
  styleUrl: './requests.css'
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
  formSubmitted = signal(false);
  isSubmitting = signal(false);


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
    this.formSubmitted.set(false);
    this.showRejectionModal.set(true);
  }


  confirmRejection() {
    this.formSubmitted.set(true);
    const claim = this.selectedClaimForRejection();
    const reason = this.rejectionReason().trim();

    if (claim && reason) {
      this.isSubmitting.set(true);
      this.http.put(`/api/claims/${claim.id}/reject?reason=${encodeURIComponent(reason)}`, {}).subscribe({
        next: () => {
          this.showRejectionModal.set(false);
          this.isSubmitting.set(false);
          this.formSubmitted.set(false);
          this.loadClaims();
        },
        error: () => {
          this.isSubmitting.set(false);
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
