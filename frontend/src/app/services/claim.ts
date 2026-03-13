import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Claim {
    id?: number;
    claimNumber?: string;
    policyApplicationId: number;
    policyNumber?: string;
    description: string;
    claimAmount: number;
    incidentDate: string;
    incidentLocation: string;
    status?: string;
    claimOfficerId?: number;
    rejectionReason?: string;
    planName?: string;
    policyholderName?: string;
}


@Injectable({
    providedIn: 'root'
})
export class ClaimService {
    private http = inject(HttpClient);
    private apiUrl = '/api/claims';

    createClaim(claim: Claim, documents?: File[]): Observable<Claim> {
        const formData = new FormData();
        formData.append('claim', new Blob([JSON.stringify(claim)], { type: 'application/json' }));

        if (documents) {
            documents.forEach(doc => formData.append('documents', doc));
        }

        return this.http.post<Claim>(this.apiUrl, formData);
    }

    getClaimsByApplication(applicationId: number): Observable<Claim[]> {
        return this.http.get<Claim[]>(`${this.apiUrl}/policy-application/${applicationId}`);
    }

    getClaimById(id: number): Observable<Claim> {
        return this.http.get<Claim>(`${this.apiUrl}/${id}`);
    }

    getClaimsByUserId(userId: number): Observable<Claim[]> {
        return this.http.get<Claim[]>(`${this.apiUrl}/user/${userId}`);
    }
}
