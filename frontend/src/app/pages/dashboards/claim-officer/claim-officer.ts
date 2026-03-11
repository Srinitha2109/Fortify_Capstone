import { Component, inject } from '@angular/core';

import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../services/auth';
import { NotificationBellComponent } from '../../../shared/notification-bell/notification-bell.component';

@Component({
  selector: 'app-claim-officer',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NotificationBellComponent],
  template: `
    <div class="flex h-screen overflow-hidden bg-slate-50 font-sans">
      <!-- Sidebar -->
      <aside class="flex flex-col bg-white border-r border-slate-200 shadow-sm transition-all duration-300 z-50 shrink-0 w-64">
        <div class="h-16 flex items-center px-6 gap-4 border-b border-slate-200">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center text-burgundy bg-burgundy/5 text-base font-black shadow-inner border border-burgundy/10">CO</div>
          <span class="font-extrabold text-burgundy text-base tracking-widest uppercase truncate">Claims Dept</span>
        </div>
        
        <nav class="flex-1 flex flex-col p-4 gap-2 overflow-y-auto">
          <a routerLink="/claim-officer/dashboard" routerLinkActive="active-link"
             [routerLinkActiveOptions]="{exact: true}"
             class="flex items-center p-3 rounded-lg transition-all duration-200 cursor-pointer gap-3 group text-slate-600 hover:bg-burgundy/5 hover:text-burgundy">
            <span class="text-xl w-6 flex justify-center group-hover:scale-110 transition-transform">📊</span>
            <span class="font-semibold tracking-wide">Summary</span>
          </a>
          
          <a routerLink="/claim-officer/requests" routerLinkActive="active-link"
             class="flex items-center p-3 rounded-lg transition-all duration-200 cursor-pointer gap-3 group text-slate-600 hover:bg-burgundy/5 hover:text-burgundy">
            <span class="text-xl w-6 flex justify-center group-hover:scale-110 transition-transform">📥</span>
            <span class="font-semibold tracking-wide">Requests</span>
          </a>

          <div class="mt-auto pt-4 border-t border-slate-100">
            <a (click)="logout()"
               class="flex items-center p-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors cursor-pointer gap-3 group">
              <span class="text-xl w-6 flex justify-center group-hover:scale-110 transition-transform">🚪</span>
              <span class="font-semibold tracking-wide">Logout</span>
            </a>
          </div>
        </nav>
      </aside>

      <!-- Main Content Area -->
      <main class="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <!-- Header -->
        <header class="bg-white border-b border-slate-200 shadow-sm flex items-center justify-between p-4 px-8 sticky top-0 z-40">
          <div>
            <h1 class="text-xl font-black text-burgundy tracking-tight uppercase">Claims Officer Dashboard</h1>
          </div>
          <div class="flex items-center gap-4">
            <app-notification-bell></app-notification-bell>
            <div class="text-right hidden sm:block">
              <span class="text-sm font-bold text-slate-500 block">{{ currentUser()?.fullName || 'Claims Specialist' }}</span>
              <span class="text-xs text-pink font-semibold uppercase tracking-tighter">Claims Officer</span>
            </div>
            <div class="w-10 h-10 bg-burgundy text-white rounded-full flex items-center justify-center font-black shadow-inner ring-4 ring-pink/20">
              {{ (currentUser()?.fullName?.substring(0,2) || 'CO').toUpperCase() }}
            </div>
          </div>
        </header>

        <!-- Content Area -->
        <div class="p-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .active-link {
      background: #8B1A3A !important;
      color: white !important;
      box-shadow: 0 4px 6px -1px rgba(139, 26, 58, 0.2);
    }
  `]
})
export class ClaimOfficerComponent {
  private authService = inject(AuthService);
  currentUser = this.authService.currentUser;

  logout() {
    this.authService.logout();
  }
}
