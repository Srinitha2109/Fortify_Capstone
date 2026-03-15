import { Component, inject, signal, OnInit } from '@angular/core';

import { AdminService, UserRequest } from '../../../../../services/admin';
import { NotificationService } from '../../../../../services/notification';

@Component({
    selector: 'app-admin-requests',
    standalone: true,
    imports: [],
    templateUrl: './requests.html',
    styleUrl: './requests.css'
})
export class RequestsComponent implements OnInit {
    private adminService = inject(AdminService);
    private notificationService = inject(NotificationService);

    requests = signal<UserRequest[]>([]);

    ngOnInit() {
        this.loadRequests();
    }

    loadRequests() {
        this.adminService.getPendingRegistrations().subscribe(data => {
            this.requests.set(data);
        });
    }

    approve(id: number) {
        this.adminService.approveRegistration(id).subscribe({
            next: () => {
                this.notificationService.show('User registration approved!', 'success');
                this.loadRequests();
            },
            error: () => this.notificationService.show('Failed to approve registration.', 'error')
        });
    }

    reject(id: number) {
        const remarks = prompt('Please enter rejection reason:');
        if (remarks !== null) {
            this.adminService.rejectRegistration(id, remarks).subscribe({
                next: () => {
                    this.notificationService.show('Registration rejected.', 'info');
                    this.loadRequests();
                },
                error: () => this.notificationService.show('Failed to reject registration.', 'error')
            });
        }
    }
}
