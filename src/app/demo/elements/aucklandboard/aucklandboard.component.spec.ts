import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AucklandboardComponent } from './aucklandboard.component';

describe('AucklandboardComponent', () => {
  let component: AucklandboardComponent;
  let fixture: ComponentFixture<AucklandboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AucklandboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AucklandboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
