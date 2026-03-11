import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Policy {
    id?: number;
    policyNumber: string;
    policyName: string;
    insuranceType: string;
    insuranceTypeDisplayName?: string;
    description: string;
    minCoverageAmount: number;
    maxCoverageAmount: number;
    basePremium: number;
    durationMonths: number;
    isActive: boolean;
}


@Injectable({
    providedIn: 'root'
})
export class PolicyService {
    private http = inject(HttpClient);
    private apiUrl = '/api/policies';

    getAllPolicies(): Observable<Policy[]> {
        return this.http.get<Policy[]>(this.apiUrl);
    }

    getPolicyById(id: number): Observable<Policy> {
        return this.http.get<Policy>(`${this.apiUrl}/${id}`);
    }

    createPolicy(policy: Policy): Observable<Policy> {
        return this.http.post<Policy>(this.apiUrl, policy);
    }

    updatePolicy(id: number, policy: Policy): Observable<Policy> {
        return this.http.put<Policy>(`${this.apiUrl}/${id}`, policy);
    }

    getActivePolicies(): Observable<Policy[]> {
        return this.http.get<Policy[]>(`${this.apiUrl}/active`);
    }

    getPoliciesByInsuranceType(type: string): Observable<Policy[]> {
        return this.http.get<Policy[]>(`${this.apiUrl}/insurance-type/${type}`);
    }

}
