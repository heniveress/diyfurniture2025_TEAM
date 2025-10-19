import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Draw2dComponent } from './draw2d.component';

describe('Draw2dComponent', () => {
  let component: Draw2dComponent;
  let fixture: ComponentFixture<Draw2dComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ Draw2dComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(Draw2dComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
