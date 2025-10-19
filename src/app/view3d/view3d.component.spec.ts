import { ComponentFixture, TestBed } from '@angular/core/testing';

import { View3DComponent } from './view3d.component';

describe('ThreeviewComponent', () => {
  let component: View3DComponent;
  let fixture: ComponentFixture<View3DComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ View3DComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(View3DComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
