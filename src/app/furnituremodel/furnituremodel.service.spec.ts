import { TestBed } from '@angular/core/testing';
import { FurnitureModelManagerService } from '/home/ubuntu/work/diyfurniture2025_TEAM/src/app/draw2d/lib/model/furniture-model-manager.service';
import { FurnitureBody, FurnitureElementType } from '/home/ubuntu/work/diyfurniture2025_TEAM/src/app/draw2d/lib/model/furniture-body.model';

// --- Minimal fake Dexie table ---
class FakeTable<T extends { id?: number }> {
  private data: T[] = [];
  private nextId = 1;

  async toArray(): Promise<T[]> {
    return [...this.data];
  }

  add(obj: any): Promise<number> {
    const id = this.nextId++;
    obj.id = id;
    this.data.push(obj);
    return Promise.resolve(id);
  }

  async clear(): Promise<void> {
    this.data = [];
  }

  delete(id: number): Promise<void> {
    this.data = this.data.filter((x: any) => x.id !== id);
    return Promise.resolve();
  }

  where(_: any) {
    return {
      first: async () => undefined,
      delete: async () => undefined,
    };
  }

  update(_: any, __: any): Promise<void> {
    return Promise.resolve();
  }
}

// --- Fake services ---
class FakeFurnituremodelService {
  furnitureBodys = new FakeTable<any>();
  furnitureBodyPosition = new FakeTable<any>();

  private selected = 0;
  setSelectedFurniture(id: number) {
    this.selected = id;
  }
  getSelectedFurniture() {
    return this.selected;
  }
}

class FakeModelchangeService {
  modelChanged() {}
}

describe('FurnitureModelManagerService (selection + duplicate)', () => {
  let service: FurnitureModelManagerService;
  let furnitureService: FakeFurnituremodelService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        FurnitureModelManagerService,
        { provide: (await import('src/app/furnituremodel/furnituremodel.service')).FurnituremodelService, useClass: FakeFurnituremodelService },
        { provide: (await import('/home/ubuntu/work/diyfurniture2025_TEAM/src/app/draw2d/lib/eventhandling/modelchange.service')).ModelchangeService, useClass: FakeModelchangeService },
      ],
    }).compileComponents();

    service = TestBed.inject(FurnitureModelManagerService);
    furnitureService = TestBed.inject((await import('src/app/furnituremodel/furnituremodel.service')).FurnituremodelService) as any;

    // ⚠️ A service használja a canvas contextet findSelectedElement-ben,
    // de ezekben a tesztekben nem hívjuk azt.
    // Ha később kell: service.cx = fakeContext;
  });

  function addBody(x: number, y: number, w = 100, h = 100) {
    const b = new FurnitureBody(
      0, 0, w, h,
      50, 18,
      FurnitureElementType.BODY,
      x, y,
      null, null, undefined
    );
    service.addFurnitureBody(b);
    return b;
  }

  it('setSingleSelectedElement: only one id stays selected', () => {
    addBody(10, 10);
    addBody(200, 10);

    service.setSingleSelectedElement(1);
    expect(service.getSelectedElementIds()).toEqual([1]);

    service.setSingleSelectedElement(2);
    expect(service.getSelectedElementIds()).toEqual([2]);
  });

  it('toggleSelectedElement: adds/removes ids', () => {
    addBody(10, 10);
    addBody(200, 10);

    service.toggleSelectedElement(1);
    service.toggleSelectedElement(2);
    expect(service.getSelectedElementIds().sort()).toEqual([1, 2]);

    service.toggleSelectedElement(1);
    expect(service.getSelectedElementIds()).toEqual([2]);
  });

  it('clearSelection: removes everything and sets selected to 0 in furnitureService', () => {
    addBody(10, 10);
    addBody(200, 10);

    service.toggleSelectedElement(1);
    service.toggleSelectedElement(2);
    service.clearSelection();

    expect(service.getSelectedElementIds()).toEqual([]);
    expect(furnitureService.getSelectedFurniture()).toBe(0);
  });

  it('duplicateSelected: duplicates the selected body and applies offset', async () => {
    const b1 = addBody(10, 10);

    // várjuk meg, hogy kapjon ID-t
    await Promise.resolve();

    service.setSingleSelectedElement(b1.id!);
    service.duplicateSelected(10, 10);

    // új elem hozzáadása is async id-vel -> 1 microtask
    await Promise.resolve();

    const bodies = service.getFurnitureBodies();
    expect(bodies.length).toBe(2);

    const copy = bodies.find(b => b.id !== b1.id)!;
    expect(copy).toBeTruthy();
    expect(copy.x).toBe(20);
    expect(copy.y).toBe(20);
    expect(copy.width).toBe(b1.width);
    expect(copy.height).toBe(b1.height);
  });

  it('duplicateSelected: duplicates multiple selected bodies', async () => {
    const b1 = addBody(10, 10);
    const b2 = addBody(200, 10);

    await Promise.resolve();

    service.toggleSelectedElement(b1.id!);
    service.toggleSelectedElement(b2.id!);

    service.duplicateSelected(10, 10);

    await Promise.resolve();

    const bodies = service.getFurnitureBodies();
    // 2 eredeti + 2 másolat
    expect(bodies.length).toBe(4);

    const originals = bodies.filter(b => b.x === 10 || b.x === 200);
    const copies = bodies.filter(b => b.x === 20 || b.x === 210);

    expect(originals.length).toBe(2);
    expect(copies.length).toBe(2);
  });

  it('isSelected: returns true only for selected ids', async () => {
    const b1 = addBody(10, 10);
    await Promise.resolve();

    service.setSingleSelectedElement(b1.id!);
    expect(service.isSelected(b1.id!)).toBeTrue();
    expect(service.isSelected(999)).toBeFalse();
  });
});
