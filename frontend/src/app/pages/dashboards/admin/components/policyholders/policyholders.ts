import { Component, inject, signal, OnInit } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { AdminService, BusinessProfile, Agent, ClaimOfficer } from '../../../../../services/admin';
import { NotificationService } from '../../../../../services/notification';

@Component({
    selector: 'app-admin-policyholders',
    standalone: true,
    imports: [FormsModule],
    templateUrl: './policyholders.html',
    styleUrl: './policyholders.css'
})
export class PolicyholdersComponent implements OnInit {
    private adminService = inject(AdminService);
    private notificationService = inject(NotificationService);

    businessProfiles = signal<BusinessProfile[]>([]);
    agents = signal<Agent[]>([]);
    claimOfficers = signal<ClaimOfficer[]>([]);

    showProfileAssignment = signal(false);
    selectedProfile = signal<BusinessProfile | null>(null);
    profileSelectedAgentId = signal<number | null>(null);
    profileSelectedClaimOfficerId = signal<number | null>(null);
    filteredAgents = signal<Agent[]>([]);
    filteredClaimOfficers = signal<ClaimOfficer[]>([]);
    assignmentStep = signal<number>(1);
    selectedSpecialization = signal<string>('');

    ngOnInit() {
        this.loadData();
    }

    loadData() {
        this.adminService.getAllBusinessProfiles().subscribe(data => this.businessProfiles.set(data));
        this.adminService.getAllAgents().subscribe(data => this.agents.set(data));
        this.adminService.getAllClaimOfficers().subscribe(data => this.claimOfficers.set(data));
    }

    openProfileAssignModal(profile: BusinessProfile) {
        this.selectedProfile.set(profile);
        this.selectedSpecialization.set(profile.industry || '');
        this.assignmentStep.set(1);
        this.profileSelectedAgentId.set(null);
        this.profileSelectedClaimOfficerId.set(null);
        this.showProfileAssignment.set(true);
    }

    goToSelectionStep() {
        const specialization = this.selectedSpecialization();
        this.adminService.getAvailableAgentsBySpecialization(specialization).subscribe(agents => {
            this.filteredAgents.set(agents);
        });

        this.adminService.getAvailableClaimOfficersBySpecialization(specialization).subscribe(officers => {
            this.filteredClaimOfficers.set(officers);
        });
        this.assignmentStep.set(2);
    }

    assignStaffToProfile() {
        const profile = this.selectedProfile();
        const agentId = this.profileSelectedAgentId();
        const officerId = this.profileSelectedClaimOfficerId();

        if (profile && agentId && officerId) {
            this.adminService.assignStaffToProfile(profile.id, agentId, officerId).subscribe({
                next: () => {
                    this.notificationService.show('Personnel assigned successfully!', 'success');
                    this.showProfileAssignment.set(false);
                    this.loadData();
                },
                error: () => this.notificationService.show('Failed to assign personnel.', 'error')
            });
        } else {
            this.notificationService.show('Please select both an agent and an officer.', 'warning');
        }
    }
}
