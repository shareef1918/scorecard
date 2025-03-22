import { ComponentFixture, TestBed } from '@angular/core/testing';
import LakeviewboardComponent from './lakeviewboard.component';

describe('LakeviewboardComponent', () => {
  let component: LakeviewboardComponent;
  let fixture: ComponentFixture<LakeviewboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LakeviewboardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(LakeviewboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
