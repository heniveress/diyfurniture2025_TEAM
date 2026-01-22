import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { Draw2dComponent } from './draw2d.component';
import { FurnitureModelManagerService } from '/home/ubuntu/work/diyfurniture2025_TEAM/src/app/draw2d/lib/model/furniture-model-manager.service';

describe('Draw2dComponent', () => {
  let component: Draw2dComponent;
  let fixture: ComponentFixture<Draw2dComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [FurnitureModelManagerService],
      declarations: [ Draw2dComponent ],
      imports: [
        MatToolbarModule,
        MatMenuModule,
        NoopAnimationsModule
      ]

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
