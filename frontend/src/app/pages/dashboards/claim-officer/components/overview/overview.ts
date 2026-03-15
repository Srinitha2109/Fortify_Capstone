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
  templateUrl: './overview.html',
  styleUrl: './overview.css'
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
