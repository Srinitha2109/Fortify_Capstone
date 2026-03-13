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

  //easy to add roles in future
  roles = [
    { value: 'POLICYHOLDER', label: 'Policyholder' },
    { value: 'AGENT', label: 'Agent' },
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
      this.authService.login(this.loginForm.value);
    } else {
      this.loginForm.markAllAsTouched();
      this.notificationService.show('Please fill all fields correctly', 'error');
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
