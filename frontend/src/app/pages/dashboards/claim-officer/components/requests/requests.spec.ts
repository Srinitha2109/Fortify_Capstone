import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestsComponent } from './requests.component'

describe('AgentOverviewComponent', () => {
    let component: RequestsComponent;
    let fixture: ComponentFixture<RequestsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RequestsComponent]
        })
            .compileComponents();
        3
        fixture = TestBed.createComponent(RequestsComponent);
        component = fixture.componentInstance;
        await fixture.whenStable();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
