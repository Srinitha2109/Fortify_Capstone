import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NotificationService } from '../../services/notification';
import { AuthService } from '../../services/auth';

export function strongPasswordValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null;
    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumeric = /[0-9]/.test(value);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value);
    const passwordValid = hasUpperCase && hasLowerCase && hasNumeric && hasSpecial && value.length >= 8;
    return !passwordValid ? { strongPassword: true } : null;
  }
}

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

  loginSection: 'choice' | 'login' | 'forgot' | 'reset' = 'choice';
  loginType: 'admin' | 'user' = 'user';
  resetEmailStr = '';

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
    role: ['', [Validators.required]],
    recaptcha: [false, [Validators.requiredTrue]]
  });

  forgotForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  resetForm = this.fb.group({
    otp: ['', [Validators.required]],
    newPassword: ['', [Validators.required, strongPasswordValidator()]],
    confirmNewPassword: ['', [Validators.required]]
  });

  userRoles = [
    { value: 'POLICYHOLDER', label: 'Policyholder' },
    { value: 'AGENT', label: 'Agent' },
    { value: 'CLAIM_OFFICER', label: 'Claim Officer' }
  ];

  isRecaptchaLoading = false;
  showPassword = false;

  getTitle() {
    if (this.loginSection === 'choice') return 'Login As';
    if (this.loginSection === 'forgot') return 'Forgot Password';
    if (this.loginSection === 'reset') return 'Reset Password';
    if (this.loginType === 'admin') return 'Admin Login';
    return 'User Login';
  }

  selectLoginType(type: 'admin' | 'user') {
    this.loginType = type;
    this.loginSection = 'login';
    if (type === 'admin') {
      this.loginForm.patchValue({ role: 'ADMIN' });
      this.loginForm.get('role')?.clearValidators();
      this.loginForm.get('role')?.updateValueAndValidity();
    } else {
      this.loginForm.patchValue({ role: '' });
      this.loginForm.get('role')?.setValidators([Validators.required]);
      this.loginForm.get('role')?.updateValueAndValidity();
    }
  }

  backToChoice() {
    this.loginSection = 'choice';
    this.loginForm.reset();
  }

  backToLogin() {
    this.loginSection = 'login';
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onLogin() {
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value);
    } else {
      this.loginForm.markAllAsTouched();
      this.notificationService.show('Please fill all fields correctly', 'error');
    }
  }

  onForgotPassword() {
    if (this.forgotForm.valid) {
      this.authService.forgotPassword(this.forgotForm.value as any).subscribe({
        next: () => {
          this.notificationService.show('OTP sent to your email', 'success');
          this.resetEmailStr = this.forgotForm.value.email || '';
          this.loginSection = 'reset';
        },
        error: (err) => {
          this.notificationService.show(err.error?.message || 'Failed to send OTP', 'error');
        }
      });
    } else {
      this.forgotForm.markAllAsTouched();
    }
  }

  onResetPassword() {
    if (this.resetForm.valid) {
      if (this.resetForm.value.newPassword !== this.resetForm.value.confirmNewPassword) {
        this.notificationService.show('Passwords do not match', 'error');
        return;
      }
      const data = {
        email: this.resetEmailStr,
        ...this.resetForm.value
      };
      this.authService.resetPassword(data).subscribe({
        next: () => {
          this.notificationService.show('Password reset successfully. Please login.', 'success');
          this.loginSection = 'login';
          this.resetForm.reset();
          this.forgotForm.reset();
        },
        error: (err) => {
          this.notificationService.show(err.error?.message || 'Failed to reset password', 'error');
        }
      });
    } else {
      this.resetForm.markAllAsTouched();
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
