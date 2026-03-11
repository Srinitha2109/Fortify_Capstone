import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Policyholder } from './policyholder';

describe('Policyholder', () => {
  let component: Policyholder;
  let fixture: ComponentFixture<Policyholder>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Policyholder]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Policyholder);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
