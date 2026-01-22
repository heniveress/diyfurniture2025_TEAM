import { MoveEventHandler } from './MoveEventHandler';
import { FurnitureBody } from 'src/app/draw2d/lib/model/furniture-body.model';

class FakeDrawSupport {
  setDrawColor(_: string) {}
  drawExistingElements() {}
  translatePage = jasmine.createSpy('translatePage');
}

class FakeModelManager {
  public selectedIds: number[] = [];
  public elements = new Map<number, any>();

  findSelectedSplit(_: number, __: number) { return null; }

  findSelectedElement(x: number, y: number): any | null {
    for (const el of this.elements.values()) {
      if (x >= el.x && x <= el.x + el.width && y >= el.y && y <= el.y + el.height) return el;
    }
    return null;
  }

  findBody(el: any) { return el; }
  findElementById(id: number) { return this.elements.get(id) ?? null; }

  getSelectedElementIds() { return [...this.selectedIds]; }

  isSelected(id: number) { return this.selectedIds.includes(id); }

  setSingleSelectedElement = jasmine.createSpy('setSingleSelectedElement').and.callFake((id: number) => {
    this.selectedIds = id && id !== 0 ? [id] : [];
  });

  toggleSelectedElement = jasmine.createSpy('toggleSelectedElement').and.callFake((id: number) => {
    const i = this.selectedIds.indexOf(id);
    if (i >= 0) this.selectedIds.splice(i, 1);
    else this.selectedIds.push(id);
  });

  refresh(_: any) {}
}

function makeBody(id: number, x: number, y: number, w: number, h: number): FurnitureBody {
  const obj: any = { id, x, y, posX: 0, posY: 0, width: w, height: h, type: 0, material: 0 };
  Object.setPrototypeOf(obj, FurnitureBody.prototype);
  return obj as FurnitureBody;
}

describe('MoveEventHandler', () => {
  let draw: FakeDrawSupport;
  let mm: FakeModelManager;
  let handler: MoveEventHandler;

  let a: any;
  let b: any;

  beforeEach(() => {
    draw = new FakeDrawSupport();
    mm = new FakeModelManager();

    a = makeBody(1, 10, 10, 100, 100);
    b = makeBody(2, 200, 10, 100, 100);

    mm.elements.set(1, a);
    mm.elements.set(2, b);

    handler = new MoveEventHandler(draw as any, mm as any);
  });

  it('ha 2 elem ki van jelölve és a kijelöltre kattintasz: mindkettő mozog (group drag)', () => {
    mm.selectedIds = [1, 2];

    handler.onStart(20, 20);        
    handler.onMove(20, 20, 50, 50); 

    expect(a.x).toBe(40);
    expect(a.y).toBe(40);
    expect(b.x).toBe(230);
    expect(b.y).toBe(40);
  });

  it('ha több van kijelölve, de egy NEM kijelölt elemre kattintasz: csak az az egy mozog (single drag)', () => {
    mm.selectedIds = [1]; // csak A kijelölt

    handler.onStart(210, 20);        // B-re kattintás
    expect(mm.setSingleSelectedElement).toHaveBeenCalledWith(2); // átvált single selection-re

    handler.onMove(210, 20, 240, 50); 

    // A marad
    expect(a.x).toBe(10);
    expect(a.y).toBe(10);

    // B mozog
    expect(b.x).toBe(230);
    expect(b.y).toBe(40);
  });

  it('ha üres részre kattintasz és húzod: page pan (translatePage) hívódik', () => {
    mm.selectedIds = []; // nincs kijelölés

    handler.onStart(500, 500); // se A se B
    handler.onMove(520, 520, 500, 500);

    expect(draw.translatePage).toHaveBeenCalled();
  });
});
