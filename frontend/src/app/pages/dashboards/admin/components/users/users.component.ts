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
        <div class="px-6 py-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h2 class="text-lg font-extrabold text-burgundy tracking-tight">System Users</h2>
                <p class="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Manage all registered accounts and roles</p>
            </div>
            <div class="flex items-center gap-3">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Filter Role:</label>
                <select [value]="selectedRole()" (change)="onRoleChange($event)" 
                        class="bg-slate-50 border border-slate-200 text-[11px] font-bold text-slate-700 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-burgundy/10 transition-all">
                    <option value="ALL">All Users</option>
                    <option value="POLICYHOLDER">Policyholders</option>
                    <option value="AGENT">Agents</option>
                    <option value="CLAIM_OFFICER">Claim Officers</option>
                </select>
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
                    @for (user of filteredUsers(); track user.id) {
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
    selectedRole = signal<string>('ALL');

    filteredUsers = signal<UserRequest[]>([]);

    ngOnInit() {
        this.loadUsers();
    }

    loadUsers() {
        this.adminService.getAllUsers().subscribe({
            next: (data) => {
                this.users.set(data);
                this.applyFilter();
            },
            error: () => this.notificationService.show('Failed to load system users.', 'error')
        });
    }

    onRoleChange(event: Event) {
        const select = event.target as HTMLSelectElement;
        this.selectedRole.set(select.value);
        this.applyFilter();
    }

    applyFilter() {
        const role = this.selectedRole();
        if (role === 'ALL') {
            this.filteredUsers.set(this.users());
        } else {
            this.filteredUsers.set(this.users().filter(u => u.role === role));
        }
    }
}
