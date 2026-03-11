import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PoliciesComponent } from './policies.component';

describe('PoliciesComponent', () => {
    let component: PoliciesComponent;
    let fixture: ComponentFixture<PoliciesComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PoliciesComponent]
        })
            .compileComponents();

        fixture = TestBed.createComponent(PoliciesComponent);
        component = fixture.componentInstance;
        await fixture.whenStable();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
