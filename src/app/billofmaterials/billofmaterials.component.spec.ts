import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BillofmaterialsComponent } from './billofmaterials.component';
import { FurnitureModelManagerService } from '/home/ubuntu/work/diyfurniture2025_TEAM/src/app/draw2d/lib/model/furniture-model-manager.service';

describe('BillofmaterialsComponent', () => {
  let component: BillofmaterialsComponent;
  let fixture: ComponentFixture<BillofmaterialsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BillofmaterialsComponent ],
      providers: [FurnitureModelManagerService]

    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BillofmaterialsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
