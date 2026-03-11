import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { PolicyApplication } from './policy-application';

export interface Agent {
    id: number;
    userId: number;
    fullName: string;
    agentCode: string;
    licenseNumber: string;
    specialization: string;
    commissionRate: number;
}

export interface ClaimOfficer {
    id: number;
    region: string;
    user: {
        id: number;
        fullName: string;
        email: string;
    };
}

export interface BusinessProfile {
    id: number;
    userId: number;
    userFullName: string;
    businessName: string;
    industry: string;
    annualRevenue: number;
    employeeCount: number;
    city: string;
    isProfileCompleted: boolean;
    agentId?: number;
    agentName?: string;
    claimOfficerId?: number;
    claimOfficerName?: string;
}

export interface UserRequest {
    id: number;
    fullName: string;
    email: string;
    phone: string;
    role: string;
    businessName?: string;
    industry?: string;
    annualRevenue?: number;
    employeeCount?: number;
    city?: string;
    experience?: number;
    specialization?: string;
    status: string;
}

@Injectable({
    providedIn: 'root'
})
export class AdminService {
    private http = inject(HttpClient);
    private apiUrl = '/api/admin';

    pendingRequests = signal<UserRequest[]>([]);

    getPendingRegistrations(): Observable<UserRequest[]> {
        return this.http.get<UserRequest[]>(`${this.apiUrl}/registration-requests`).pipe(
            tap(requests => this.pendingRequests.set(requests))
        );
    }

    approveRegistration(id: number): Observable<UserRequest> {
        return this.http.patch<UserRequest>(`${this.apiUrl}/registration-requests/${id}/approve`, {});
    }

    rejectRegistration(id: number, remarks: string): Observable<UserRequest> {
        return this.http.patch<UserRequest>(`${this.apiUrl}/registration-requests/${id}/reject`, remarks);
    }

    getAllUsers(): Observable<UserRequest[]> {
        return this.http.get<UserRequest[]>(`${this.apiUrl}/users`);
    }

    getAllAgents(): Observable<Agent[]> {
        return this.http.get<Agent[]>('/api/agents');
    }

    getAvailableAgentsBySpecialization(industry: string): Observable<Agent[]> {
        return this.http.get<Agent[]>(`/api/agents/available?specialization=${industry}`);
    }

    getAvailableClaimOfficersBySpecialization(industry: string): Observable<ClaimOfficer[]> {
        return this.http.get<ClaimOfficer[]>(`/api/claim-officers/available/${industry}`);
    }

    getAllClaimOfficers(): Observable<ClaimOfficer[]> {
        return this.http.get<ClaimOfficer[]>('/api/claim-officers');
    }

    getAllBusinessProfiles(): Observable<BusinessProfile[]> {
        return this.http.get<BusinessProfile[]>('/api/business-profiles');
    }

    assignStaffToProfile(profileId: number, agentId: number, claimOfficerId: number): Observable<BusinessProfile> {
        return this.http.put<BusinessProfile>(
            `/api/business-profiles/${profileId}/assign-staff?agentId=${agentId}&claimOfficerId=${claimOfficerId}`,
            {}  //passing empty json body because data is passed through query params structure is (url,body)
        );
    }
}
