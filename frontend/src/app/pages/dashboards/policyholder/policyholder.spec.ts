import 'zone.js';
import 'zone.js/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { vi } from 'vitest';
import { PolicyholderComponent } from './policyholder';
import { AuthService } from '../../../services/auth';
import { PolicySearchService } from '../../../services/policy-search.service';

describe('PolicyholderComponent', () => {
  let component: PolicyholderComponent;
  let fixture: ComponentFixture<PolicyholderComponent>;
  let authServiceSpy: any;

  beforeEach(async () => {
    authServiceSpy = {
        logout: vi.fn(),
        currentUser: vi.fn()
    };
    authServiceSpy.currentUser.mockReturnValue({ id: 5, fullName: 'Jane Smith' });

    await TestBed.configureTestingModule({
      imports: [PolicyholderComponent, HttpClientTestingModule, RouterTestingModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        PolicySearchService
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PolicyholderComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start with sidebar not collapsed', () => {
    expect(component.isSidebarCollapsed()).toBe(false);
  });

  it('should toggle sidebar collapsed state', () => {
    component.toggleSidebar();
    expect(component.isSidebarCollapsed()).toBe(true);
    component.toggleSidebar();
    expect(component.isSidebarCollapsed()).toBe(false);
  });

  it('should call authService.logout when logout() is called', () => {
    component.logout();
    expect(authServiceSpy.logout).toHaveBeenCalled();
  });

  it('should update navSearchQuery and policySearchService on onNavSearch()', () => {
    const searchServiceSpy = vi.spyOn(component.policySearchService, 'setQuery');
    component.onNavSearch('fire insurance');
    expect(component.navSearchQuery()).toBe('fire insurance');
    expect(searchServiceSpy).toHaveBeenCalledWith('fire insurance');
  });

  it('should start with empty nav search query', () => {
    expect(component.navSearchQuery()).toBe('');
  });
});
