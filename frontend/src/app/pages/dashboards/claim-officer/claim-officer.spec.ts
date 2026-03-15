import 'zone.js';
import 'zone.js/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { vi } from 'vitest';
import { ClaimOfficerComponent } from './claim-officer';
import { AuthService } from '../../../services/auth';

describe('ClaimOfficerComponent', () => {
  let component: ClaimOfficerComponent;
  let fixture: ComponentFixture<ClaimOfficerComponent>;
  let authServiceSpy: any;

  beforeEach(async () => {
    authServiceSpy = {
        logout: vi.fn(),
        currentUser: vi.fn()
    };
    authServiceSpy.currentUser.mockReturnValue({ id: 3, fullName: 'Alex Officer' });

    await TestBed.configureTestingModule({
      imports: [ClaimOfficerComponent, HttpClientTestingModule, RouterTestingModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClaimOfficerComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expose currentUser from authService', () => {
    expect(component.currentUser()).toEqual({ id: 3, fullName: 'Alex Officer' });
  });

  it('should call authService.logout when logout() is called', () => {
    component.logout();
    expect(authServiceSpy.logout).toHaveBeenCalled();
  });
});
