import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AucklandbannerComponent } from './aucklandbanner.component';

describe('AucklandbannerComponent', () => {
  let component: AucklandbannerComponent;
  let fixture: ComponentFixture<AucklandbannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AucklandbannerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AucklandbannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
