import 'zone.js';
import 'zone.js/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { vi } from 'vitest';
import { AgentComponent } from './agent';
import { AuthService } from '../../../services/auth';

describe('AgentComponent', () => {
  let component: AgentComponent;
  let fixture: ComponentFixture<AgentComponent>;
  let authServiceSpy: any;

  beforeEach(async () => {
    authServiceSpy = {
        logout: vi.fn(),
        currentUser: vi.fn()
    };
    authServiceSpy.currentUser.mockReturnValue({ id: 2, fullName: 'John Agent' });

    await TestBed.configureTestingModule({
      imports: [AgentComponent, HttpClientTestingModule, RouterTestingModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgentComponent);
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

  it('should get initials from full name', () => {
    expect(component.getInitials('John Doe')).toBe('JD');
  });

  it('should get initials from single-word name (first 2 chars)', () => {
    expect(component.getInitials('Alice')).toBe('AL');
  });

  it('should return "AG" for null name', () => {
    expect(component.getInitials(null)).toBe('AG');
  });

  it('should return "AG" for undefined name', () => {
    expect(component.getInitials(undefined)).toBe('AG');
  });

  it('should return "AG" for empty string name', () => {
    expect(component.getInitials('')).toBe('AG');
  });

  it('should handle three-word names and take first two initials', () => {
    expect(component.getInitials('Maria Elena Santos')).toBe('ME');
  });

  it('should expose currentUser from authService', () => {
    expect(component.currentUser()).toEqual({ id: 2, fullName: 'John Agent' });
  });
});
