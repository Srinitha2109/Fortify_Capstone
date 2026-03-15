import { CommonModule } from '@angular/common';
import { Component, inject, signal, OnInit } from '@angular/core';
import { ClaimService, Claim } from '../../../../services/claim';
import { AuthService } from '../../../../services/auth';

@Component({
  selector: 'app-policyholder-claims',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './claims.html',
  styleUrl: './claims.css'
})
export class ClaimsComponent implements OnInit {
  private claimService = inject(ClaimService);
  private authService = inject(AuthService);

  claims = signal<Claim[]>([]);
  isLoading = signal(true);

  ngOnInit() {
    this.loadClaims();
  }

  loadClaims() {
    const user = this.authService.currentUser();
    if (user && user.id) {
      this.claimService.getClaimsByUserId(user.id).subscribe({
        next: (data) => {
          this.claims.set(data);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false)
      });
    }
  }

  getStatusClass(status: string | undefined): string {
    switch (status) {
      case 'SUBMITTED': return 'bg-burgundy/5 text-burgundy border-burgundy/20';
      case 'APPROVED': return 'bg-pink/10 text-pink border-pink/20';
      case 'REJECTED': return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'SETTLED': return 'bg-burgundy text-white border-burgundy';
      default: return 'bg-slate-100 text-slate-500 border-slate-200';
    }
  }
}
