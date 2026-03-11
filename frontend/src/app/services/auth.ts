import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = '/api';

  currentUser = signal<any>(null);

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/request-registration`, userData);
  }

  // Login is handled differently in backend, usually returning a JWT
  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap((res: any) => {
        if (res && res.userId) {
          res.id = res.userId;
        }
        this.currentUser.set(res);
        console.log('Login Response:', res);
        if (res.token) {
          localStorage.setItem('token', res.token);
        }
      })
    );
  }

  // login(credentials: any) {
  //   this.http.post(`${this.apiUrl}/auth/login`, credentials).subscribe((res: any) => {

  //     if (res && res.userId) {
  //       res.id = res.userId;
  //     }

  //     this.currentUser.set(res);

  //     if (res.token) {
  //       localStorage.setItem('token', res.token);
  //     }

  //     console.log('Login Response:', res);

  //   });
  // }

  logout() {
    this.currentUser.set(null);
    localStorage.removeItem('token');
    this.router.navigate(['/landing']);
  }
}
