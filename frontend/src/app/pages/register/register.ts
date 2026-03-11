import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NotificationService } from '../../services/notification';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);

  registerForm = this.fb.group({
    fullName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required]],
    role: ['POLICYHOLDER', [Validators.required]],
    // Policyholder fields
    businessName: [''],
    industry: [''],
    annualRevenue: [''],
    employeeCount: [''],
    city: [''],
    // Agent/Claim Officer fields
    experience: [''],
    specialization: [''],
    territory: [''],
    region: ['']
  });

  roles = [
    { value: 'POLICYHOLDER', label: 'Policyholder' },
    { value: 'AGENT', label: 'Agent' },
    // { value: 'UNDERWRITER', label: 'Underwriter' },
    { value: 'CLAIM_OFFICER', label: 'Claim Officer' }
  ];


  specializationOptions = [
    { value: 'TECHNOLOGY', label: 'Technology' },
    { value: 'CONSTRUCTION', label: 'Construction' },
    { value: 'MANUFACTURING', label: 'Manufacturing' },
    { value: 'RETAIL', label: 'Retail' }
  ];

  get role(): string {
    return this.registerForm.get('role')?.value || '';
  }

  onRegister() {
    if (this.registerForm.valid) {
      this.authService.register(this.registerForm.value).subscribe({
        next: () => {
          this.notificationService.show('Request received! Admin will review and contact you via email', 'success');
          this.router.navigate(['/login']);
        },
        error: () => this.notificationService.show('Submission failed. Please try again.', 'error')
      });
    } else {
      this.notificationService.show('Please fill all required fields', 'error');
    }
  }
}
