import { Routes } from '@angular/router';
import { LandingComponent } from './pages/landing/landing';
import { LoginComponent } from './pages/login/login';
import { RegisterComponent } from './pages/register/register';
import { AdminComponent } from './pages/dashboards/admin/admin';
import { PolicyholderComponent } from './pages/dashboards/policyholder/policyholder';
import { AgentComponent } from './pages/dashboards/agent/agent';
import { ClaimOfficerComponent } from './pages/dashboards/claim-officer/claim-officer';
import { OverviewComponent } from './pages/dashboards/policyholder/overview/overview';
import { PoliciesComponent } from './pages/dashboards/policyholder/policies/policies';
import { ApplicationsComponent } from './pages/dashboards/policyholder/applications/applications';
import { ClaimsComponent } from './pages/dashboards/policyholder/claims/claims';
import { PaymentsComponent } from './pages/dashboards/policyholder/payments/payments';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
    { path: '', redirectTo: 'landing', pathMatch: 'full' },
    { path: 'landing', component: LandingComponent },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    {
        path: 'admin',
        component: AdminComponent,
        canActivate: [authGuard],
        data: { roles: ['ADMIN'] },
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', loadComponent: () => import('./pages/dashboards/admin/components/overview/overview').then(m => m.OverviewComponent) },
            { path: 'requests', loadComponent: () => import('./pages/dashboards/admin/components/requests/requests').then(m => m.RequestsComponent) },
            { path: 'policies', loadComponent: () => import('./pages/dashboards/admin/components/policies/policies').then(m => m.PoliciesComponent) },
            { path: 'policyholders', loadComponent: () => import('./pages/dashboards/admin/components/policyholders/policyholders').then(m => m.PolicyholdersComponent) },
            { path: 'users', loadComponent: () => import('./pages/dashboards/admin/components/users/users').then(m => m.UsersComponent) },
        ]
    },
    { path: 'admin/dashboard', redirectTo: 'admin/dashboard', pathMatch: 'full' },
    {
        path: 'policyholder',
        component: PolicyholderComponent,
        canActivate: [authGuard],
        data: { roles: ['POLICYHOLDER'] },
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', component: OverviewComponent },
            { path: 'policies', component: PoliciesComponent },
            { path: 'applications', component: ApplicationsComponent },
            { path: 'claims', component: ClaimsComponent },
            { path: 'payments', component: PaymentsComponent },
        ]
    },
    { path: 'policyholder/dashboard', redirectTo: 'policyholder/dashboard', pathMatch: 'full' }, // Keep for compatibility if needed, but handled by child
    {
        path: 'agent',
        component: AgentComponent,
        canActivate: [authGuard],
        data: { roles: ['AGENT'] },
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', loadComponent: () => import('./pages/dashboards/agent/components/overview/overview').then(m => m.OverviewComponent) },
            { path: 'requests', loadComponent: () => import('./pages/dashboards/agent/components/requests/requests').then(m => m.RequestsComponent) },
        ]
    },

    {
        path: 'claim-officer',
        canActivate: [authGuard],
        data: { roles: ['CLAIM_OFFICER'] },
        loadComponent: () => import('./pages/dashboards/claim-officer/claim-officer').then(m => m.ClaimOfficerComponent),
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', loadComponent: () => import('./pages/dashboards/claim-officer/components/overview/overview').then(m => m.OverviewComponent) },
            { path: 'requests', loadComponent: () => import('./pages/dashboards/claim-officer/components/requests/requests').then(m => m.RequestsComponent) },
        ]
    },
];
