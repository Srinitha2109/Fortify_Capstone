import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimsComponent } from './claims'

describe('AgentOverviewComponent', () => {
    let component: ClaimsComponent;
    let fixture: ComponentFixture<ClaimsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ClaimsComponent]
        })
            .compileComponents();

        fixture = TestBed.createComponent(ClaimsComponent);
        component = fixture.componentInstance;
        await fixture.whenStable();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
