import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NotificationService } from '../../services/notification';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
    role: ['', [Validators.required]],
    recaptcha: [false, [Validators.requiredTrue]]
  });

  roles = [
    { value: 'POLICYHOLDER', label: 'Policyholder' },
    { value: 'AGENT', label: 'Agent' },
    // { value: 'UNDERWRITER', label: 'Underwriter' },
    { value: 'CLAIM_OFFICER', label: 'Claim Officer' },
    { value: 'ADMIN', label: 'Administrator' }
  ];

  isRecaptchaLoading = false;
  showPassword = false;

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onLogin() {
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value).subscribe({
        next: (res) => {
          this.notificationService.show('Logged in successfully', 'success');
          this.navigateByRole(this.loginForm.value.role);
        },
        error: (err) => {
          this.notificationService.show(err.error?.message || 'Login failed. Please check credentials.', 'error');
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
      this.notificationService.show('Please fill all fields correctly', 'error');
    }
  }

  //   onLogin() {
  //   if (this.loginForm.valid) {
  //     this.authService.login(this.loginForm.value);
  //     this.navigateByRole(this.loginForm.value.role);
  //   } else {
  //     this.loginForm.markAllAsTouched();
  //     this.notificationService.show('Please fill all fields correctly', 'error');
  //   }
  // }

  private navigateByRole(role: string | null | undefined) {
    switch (role) {
      case 'ADMIN': this.router.navigate(['/admin/dashboard']); break;
      case 'POLICYHOLDER': this.router.navigate(['/policyholder/dashboard']); break;
      case 'AGENT': this.router.navigate(['/agent/dashboard']); break;
      case 'CLAIM_OFFICER': this.router.navigate(['/claim-officer/dashboard']); break;
      default: this.router.navigate(['/landing']);
    }
  }

  handleRecaptcha() {
    this.isRecaptchaLoading = true;
    setTimeout(() => {
      this.isRecaptchaLoading = false;
      this.loginForm.patchValue({ recaptcha: true });
    }, 1000);
  }
}
