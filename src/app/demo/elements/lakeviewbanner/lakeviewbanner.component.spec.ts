import { ComponentFixture, TestBed } from '@angular/core/testing';
import LakeviewbannerComponent from './lakeviewbanner.component';

describe('LakeviewbannerComponent', () => {
  let component: LakeviewbannerComponent;
  let fixture: ComponentFixture<LakeviewbannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LakeviewbannerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LakeviewbannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
