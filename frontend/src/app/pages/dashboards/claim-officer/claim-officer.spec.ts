import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimOfficer } from './claim-officer';

describe('ClaimOfficer', () => {
  let component: ClaimOfficer;
  let fixture: ComponentFixture<ClaimOfficer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClaimOfficer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClaimOfficer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
