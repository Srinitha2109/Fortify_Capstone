import 'zone.js';
import 'zone.js/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { AdminComponent } from './admin';
import { AuthService } from '../../../services/auth';

describe('AdminComponent', () => {
  let component: AdminComponent;
  let fixture: ComponentFixture<AdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminComponent, HttpClientTestingModule, RouterTestingModule],
      providers: [AuthService]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start with sidebar open', () => {
    expect(component.isSidebarOpen()).toBe(true);
  });

  it('should toggle sidebar', () => {
    component.toggleSidebar();
    expect(component.isSidebarOpen()).toBe(false);
  });
});
