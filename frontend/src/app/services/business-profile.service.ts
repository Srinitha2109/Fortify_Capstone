import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface BusinessProfile {
    id?: number;
    userId?: number;
    businessName: string;
    industry: string;
    annualRevenue: number;
    employeeCount: number;
    city: string;
    isProfileCompleted: boolean;
    agentId?: number;
    claimOfficerId?: number;
}

@Injectable({
    providedIn: 'root'
})
export class BusinessProfileService {
    private http = inject(HttpClient);
    private apiUrl = '/api/business-profiles';

    createProfile(profile: BusinessProfile): Observable<BusinessProfile> {
        return this.http.post<BusinessProfile>(this.apiUrl, profile);
    }

    getProfileByUserId(userId: number): Observable<BusinessProfile> {
        return this.http.get<BusinessProfile>(`${this.apiUrl}/user/${userId}`);
    }

    updateProfile(id: number, profile: BusinessProfile): Observable<BusinessProfile> {
        return this.http.put<BusinessProfile>(`${this.apiUrl}/${id}`, profile);
    }
}
