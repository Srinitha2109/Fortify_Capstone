import { Component, inject, signal, OnInit } from '@angular/core';

import { AdminService, UserRequest } from '../../../../../services/admin';
import { NotificationService } from '../../../../../services/notification';

@Component({
    selector: 'app-admin-users',
    standalone: true,
    imports: [],
    templateUrl: './users.html',
    styleUrl: './users.css'
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
