import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BehaviorSubject } from 'rxjs';

import { Draw2dComponent } from 'src/app/draw2d/draw2d.component';

import { FurnitureModelManagerService } from 'src/app/draw2d/lib/model/furniture-model-manager.service';
import { FurnituremodelService } from 'src/app/furnituremodel/furnituremodel.service';
import { ModelchangeService } from 'src/app/draw2d/lib/eventhandling/modelchange.service';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';

describe('Draw2dComponent integration (component + service)', () => {
  let fixture: ComponentFixture<Draw2dComponent>;
  let component: Draw2dComponent;

  const furnitureServiceMock: any = {
    furnitureBodys: {
      toArray: () => Promise.resolve([]),
      add: () => Promise.resolve(1),
      update: () => Promise.resolve(),
      delete: () => Promise.resolve(),
      clear: () => Promise.resolve(),
    },
    furnitureBodyPosition: {
      where: () => ({
        first: () => Promise.resolve(undefined),
        delete: () => Promise.resolve(),
      }),
      add: () => Promise.resolve(),
      update: () => Promise.resolve(),
      clear: () => Promise.resolve(),
    },
    setSelectedFurniture: () => {},
  };

  const modelChangeMock: any = {
    modelChanged: jasmine.createSpy('modelChanged'),
    subject$: new BehaviorSubject<any>(null),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Draw2dComponent],
      imports: [
        NoopAnimationsModule,
        MatToolbarModule,
        MatButtonToggleModule,
        MatButtonModule,
        MatIconModule,
        MatSidenavModule,
      ],
      providers: [
        { provide: FurnituremodelService, useValue: furnitureServiceMock },
        { provide: ModelchangeService, useValue: modelChangeMock },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(Draw2dComponent);
    component = fixture.componentInstance;

    spyOn(component, 'drawRectangles').and.stub();

    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('clearAllElements() should call modelManager.clearAllElements + clear selection + redraw', () => {
    const manager = fixture.debugElement.injector.get(FurnitureModelManagerService);

    spyOn(manager, 'clearAllElements').and.callThrough();

    (component as any)._selectedElement = { origin: {} } as any;
    (component as any)._selectedElementBody = {} as any;

    component.clearAllElements();

    expect(manager.clearAllElements).toHaveBeenCalled();
    expect((component as any)._selectedElement).toBeNull();
    expect((component as any)._selectedElementBody).toBeNull();
    expect(component.drawRectangles).toHaveBeenCalled();
  });
});