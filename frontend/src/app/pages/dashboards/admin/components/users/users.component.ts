import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService, UserRequest } from '../../../../../services/admin';
import { NotificationService } from '../../../../../services/notification';

@Component({
    selector: 'app-admin-users',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden animate-in fade-in duration-300">
        <div class="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <div>
                <h2 class="text-lg font-extrabold text-burgundy tracking-tight">System Users</h2>
                <p class="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Manage all registered accounts and roles</p>
            </div>
        </div>

        <div class="overflow-x-auto">
            <table class="w-full border-collapse">
                <thead>
                    <tr class="bg-slate-50 border-b border-slate-100">
                        <th class="px-6 py-4 text-left text-[10px] font-black text-burgundy uppercase tracking-widest">User Profile</th>
                        <th class="px-6 py-4 text-left text-[10px] font-black text-burgundy uppercase tracking-widest">Email Address</th>
                        <th class="px-6 py-4 text-left text-[10px] font-black text-burgundy uppercase tracking-widest">Role</th>
                        <th class="px-6 py-4 text-left text-[10px] font-black text-burgundy uppercase tracking-widest">Status</th>
                        <th class="px-6 py-4 text-left text-[10px] font-black text-burgundy uppercase tracking-widest">Phone</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                    @for (user of users(); track user.id) {
                    <tr class="hover:bg-slate-50/50 transition-colors">
                        <td class="px-6 py-5">
                            <p class="text-sm font-bold text-slate-800">{{ user.fullName }}</p>
                            <p class="text-[10px] text-slate-500 font-semibold uppercase tracking-tighter">ID: #{{ user.id }}</p>
                        </td>
                        <td class="px-6 py-5 text-sm font-medium text-slate-600">{{ user.email }}</td>
                        <td class="px-6 py-5">
                            <span class="px-2 py-1 bg-burgundy/5 text-burgundy text-[9px] font-bold uppercase rounded border border-burgundy/10">{{ user.role }}</span>
                        </td>
                        <td class="px-6 py-5">
                             <span class="px-2.5 py-1 text-[10px] font-bold uppercase rounded-full"
                                [class.bg-green-100]="user.status === 'ACTIVE'"
                                [class.text-green-700]="user.status === 'ACTIVE'"
                                [class.bg-amber-100]="user.status === 'PENDING'"
                                [class.text-amber-700]="user.status === 'PENDING'">{{ user.status }}</span>
                        </td>
                        <td class="px-6 py-5 text-xs font-semibold text-slate-500">{{ user.phone || 'N/A' }}</td>
                    </tr>
                    } @empty {
                    <tr>
                        <td colspan="5" class="px-6 py-20 text-center">
                            <p class="font-bold text-slate-400 italic">No system users found.</p>
                        </td>
                    </tr>
                    }
                </tbody>
            </table>
        </div>
    </div>
  `
})
export class UsersComponent implements OnInit {
    private adminService = inject(AdminService);
    private notificationService = inject(NotificationService);

    users = signal<UserRequest[]>([]);

    ngOnInit() {
        this.loadUsers();
    }

    loadUsers() {
        this.adminService.getAllUsers().subscribe({
            next: (data) => this.users.set(data),
            error: () => this.notificationService.show('Failed to load system users.', 'error')
        });
    }
}
