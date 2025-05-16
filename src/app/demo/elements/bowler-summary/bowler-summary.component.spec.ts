import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BowlerSummaryComponent } from './bowler-summary.component';

describe('BowlerSummaryComponent', () => {
  let component: BowlerSummaryComponent;
  let fixture: ComponentFixture<BowlerSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BowlerSummaryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BowlerSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
