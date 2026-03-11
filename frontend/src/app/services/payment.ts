import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Payment {
    id?: number;
    policyApplicationId: number;
    amount: number;
    paymentDate?: string;
    paymentMethod: string;
    transactionReference?: string;
    paymentType?: 'PREMIUM' | 'CLAIM';
    status?: 'PENDING' | 'SUCCESS' | 'FAILED';
    policyNumber?: string;
    planName?: string;
}

@Injectable({
    providedIn: 'root'
})
export class PaymentService {
    private http = inject(HttpClient);
    private apiUrl = '/api/payments';

    createPayment(payment: Payment): Observable<Payment> {
        return this.http.post<Payment>(this.apiUrl, payment);
    }

    getPaymentsByApplication(applicationId: number): Observable<Payment[]> {
        return this.http.get<Payment[]>(`${this.apiUrl}/application/${applicationId}`);
    }

    getPaymentsByUserId(userId: number): Observable<Payment[]> {
        return this.http.get<Payment[]>(`${this.apiUrl}/user/${userId}`);
    }
}
