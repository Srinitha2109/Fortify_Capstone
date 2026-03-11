import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PolicyholderComponent } from './policyholder';

describe('Policyholder', () => {
  let component: PolicyholderComponent;
  let fixture: ComponentFixture<PolicyholderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PolicyholderComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(PolicyholderComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
