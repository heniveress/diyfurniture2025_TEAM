import { TestBed } from '@angular/core/testing';
import { FurnitureModelManagerService } from './furniture-model-manager.service';
import { FurnituremodelService } from 'src/app/furnituremodel/furnituremodel.service';
import { ModelchangeService } from '../eventhandling/modelchange.service';
import { FurnitureBody, FurnitureElementType } from './furniture-body.model';

/**
 * Unit tests for FurnitureModelManagerService (Undo feature).
 * Test type: Service Unit Test (Jasmine/Karma)
 * Dependencies are mocked to isolate service logic from persistence/DB layer.
 */

describe('FurnitureModelManagerService - undo', () => {
  let service: FurnitureModelManagerService;

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
  };

  function makeBody(id: number, x: number, y: number, w: number, h: number) {
    return new FurnitureBody(
      0,
      0,
      w,
      h,
      500,
      18,
      FurnitureElementType.BODY,
      x,
      y,
      null,
      null,
      id
    );
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        FurnitureModelManagerService,
        { provide: FurnituremodelService, useValue: furnitureServiceMock },
        { provide: ModelchangeService, useValue: modelChangeMock },
      ],
    });

    service = TestBed.inject(FurnitureModelManagerService);
    modelChangeMock.modelChanged.calls.reset();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('undo() should resolve when undo stack is empty', async () => {
    await expectAsync(service.undo()).toBeResolved();
    expect(modelChangeMock.modelChanged).not.toHaveBeenCalled();
  });

  it('undo() should restore previous rectangles snapshot', async () => {
    // Start stage
    const body1 = makeBody(1, 10, 10, 100, 50);
    service.getFurnitureBodies().push(body1);

    // Save the undo state
    (service as any).pushUndoState();

    // Modify the state
    service.getFurnitureBodies().length = 0;
    const body2 = makeBody(2, 99, 99, 200, 60);
    service.getFurnitureBodies().push(body2);

    // Undo should be body1
    await service.undo();

    const bodies = service.getFurnitureBodies();
    expect(bodies.length).toBe(1);
    expect(bodies[0].id).toBe(1);
    expect((bodies[0] as FurnitureBody).x).toBe(10);
    expect((bodies[0] as FurnitureBody).y).toBe(10);

    // UI update signal
    expect(modelChangeMock.modelChanged).toHaveBeenCalled();
  });

  it('pushUndoState() should store JSON-friendly snapshots (no class instances needed)', () => {
    service.getFurnitureBodies().length = 0;
    service.getFurnitureBodies().push(makeBody(5, 1, 2, 3, 4));

    (service as any).pushUndoState();

    const stack = (service as any).undoStack;
    expect(stack.length).toBeGreaterThan(0);

    const last = stack[stack.length - 1];
    expect(Array.isArray(last)).toBeTrue();
    expect(last[0].id).toBe(5);
    expect(last[0] instanceof FurnitureBody).toBeFalse();
  });

  it('undo stack should not grow beyond undoLimit', () => {
    const limit = (service as any).undoLimit ?? 20;

    for (let i = 0; i < limit + 5; i++) {
      service.getFurnitureBodies().length = 0;
      service.getFurnitureBodies().push(makeBody(i, i, i, 10, 10));
      (service as any).pushUndoState();
    }

    const stack = (service as any).undoStack;
    expect(stack.length).toBe(limit);
  });

});
