import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BillofmaterialsComponent } from './billofmaterials.component';

describe('BillofmaterialsComponent', () => {
  let component: BillofmaterialsComponent;
  let fixture: ComponentFixture<BillofmaterialsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BillofmaterialsComponent ]
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
