import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatchesCardComponent } from './matches-card.component';

describe('MatchesCardComponent', () => {
  let component: MatchesCardComponent;
  let fixture: ComponentFixture<MatchesCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatchesCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MatchesCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
