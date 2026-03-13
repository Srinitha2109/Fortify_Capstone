import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NotificationService } from '../../services/notification';
import { AuthService } from '../../services/auth';
import { ValidatorFn } from '@angular/forms';

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
    email: [
      '',
      [
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9._%+-]+@gmail\\.com$')
      ]
    ],
    phone: ['', [Validators.required]],
    role: ['POLICYHOLDER', [Validators.required]],
    // Policyholder fields
    businessName: ['', [Validators.required]],
    industry: ['', [Validators.required]],
    annualRevenue: ['', [Validators.required]],
    employeeCount: ['', [Validators.required]],
    city: ['', [Validators.required]],
    // Agent/Claim Officer fields
    experience: [''],
    specialization: [''],
    territory: [''],
    region: [''],
    formSubmitted: [false]
  });

  constructor() {
    this.registerForm.get('role')?.valueChanges.subscribe(role => {
      this.updateValidators(role || '');
    });
  }

  private updateValidators(role: string) {
    const phFields = ['businessName', 'industry', 'annualRevenue', 'employeeCount', 'city'];
    const proFields = ['experience', 'specialization'];
    const agentFields = ['territory'];
    const coFields = ['region'];

    const allFields = [...phFields, ...proFields, ...agentFields, ...coFields];
    allFields.forEach(f => {
      const ctrl = this.registerForm.get(f);
      ctrl?.clearValidators();
      ctrl?.updateValueAndValidity();
    });

    if (role === 'POLICYHOLDER') {
      phFields.forEach(f => this.registerForm.get(f)?.setValidators([Validators.required]));
    } else {
      proFields.forEach(f => this.registerForm.get(f)?.setValidators([Validators.required]));
      if (role === 'AGENT') {
        agentFields.forEach(f => this.registerForm.get(f)?.setValidators([Validators.required]));
      } else if (role === 'CLAIM_OFFICER') {
        coFields.forEach(f => this.registerForm.get(f)?.setValidators([Validators.required]));
      }
    }

    allFields.forEach(f => this.registerForm.get(f)?.updateValueAndValidity());
  }

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
      this.registerForm.get('formSubmitted')?.setValue(true);
      this.registerForm.markAllAsTouched();
      this.notificationService.show('Please fill all required fields', 'error');
    }
  }
}
