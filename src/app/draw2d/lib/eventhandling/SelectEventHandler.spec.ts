import { SelectEventHandler } from './SelectEventHandler';
import { FurnitureBody } from 'src/app/draw2d/lib/model/furniture-body.model';

class FakeDrawSupport {
  setDrawColor(_: string) {}
  drawExistingElements() {}
  changeSelectedElements = jasmine.createSpy('changeSelectedElements');
}

class FakeModelManager {
  public selectedIds: number[] = [];
  public elements = new Map<number, any>();

  findSelectedElement(x: number, y: number): any | null {
    for (const el of this.elements.values()) {
      if (x >= el.x && x <= el.x + el.width && y >= el.y && y <= el.y + el.height) return el;
    }
    return null;
  }

  findBody(el: any) { return el; }

  setSingleSelectedElement = jasmine.createSpy('setSingleSelectedElement').and.callFake((id: number) => {
    this.selectedIds = id && id !== 0 ? [id] : [];
  });

  toggleSelectedElement = jasmine.createSpy('toggleSelectedElement').and.callFake((id: number) => {
    if (!id || id === 0) return;
    const i = this.selectedIds.indexOf(id);
    if (i >= 0) this.selectedIds.splice(i, 1);
    else this.selectedIds.push(id);
  });

  getSelectedElements() {
    return this.selectedIds.map(id => this.elements.get(id)).filter(Boolean);
  }
}

function makeBody(id: number, x: number, y: number, w: number, h: number): FurnitureBody {
  const obj: any = { id, x, y, posX: 0, posY: 0, width: w, height: h, type: 0, material: 0 };
  Object.setPrototypeOf(obj, FurnitureBody.prototype); 
  return obj as FurnitureBody;
}

describe('SelectEventHandler', () => {
  let draw: FakeDrawSupport;
  let mm: FakeModelManager;
  let handler: SelectEventHandler;

  beforeEach(() => {
    draw = new FakeDrawSupport();
    mm = new FakeModelManager();

    const a = makeBody(1, 10, 10, 100, 100);
    const b = makeBody(2, 200, 10, 100, 100);
    mm.elements.set(1, a);
    mm.elements.set(2, b);

    handler = new SelectEventHandler(draw as any, mm as any);
  });

  it('shift nélkül: single select (a korábbi kijelölés törlődik)', () => {
    handler.onStart(20, 20, { shift: false }); // A-ra katt
    expect(mm.setSingleSelectedElement).toHaveBeenCalledWith(1);

    handler.onStart(210, 20, { shift: false }); // B-re katt
    expect(mm.setSingleSelectedElement).toHaveBeenCalledWith(2);
    expect(mm.selectedIds).toEqual([2]);
  });

  it('shift-tel: toggle multi-select (hozzáad / elvesz)', () => {
    handler.onStart(20, 20, { shift: false }); // A
    expect(mm.selectedIds).toEqual([1]);

    handler.onStart(210, 20, { shift: true }); // +B
    expect(mm.toggleSelectedElement).toHaveBeenCalledWith(2);
    expect(mm.selectedIds.sort()).toEqual([1, 2]);

    handler.onStart(210, 20, { shift: true }); // -B
    expect(mm.selectedIds).toEqual([1]);
  });
});
