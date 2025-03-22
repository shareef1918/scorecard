import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BannerThemeAComponent } from './banner-theme-a.component';

describe('BannerThemeAComponent', () => {
  let component: BannerThemeAComponent;
  let fixture: ComponentFixture<BannerThemeAComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BannerThemeAComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BannerThemeAComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
