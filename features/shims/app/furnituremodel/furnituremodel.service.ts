// Minimal shim for FurnituremodelService to avoid Dexie/Angular dependencies during Cucumber runs

import { Body, BodyFrontDetails, FrontElement } from '../../../../src/app/furnituremodel/furnituremodels';

class InMemoryTable<T extends { id?: number }> {
  private items: T[] = [];
  private nextId = 1;

  async add(item: T): Promise<number> {
    const id = this.nextId++;
    (item as any).id = id;
    this.items.push(item);
    return id;
  }

  async update(id: number, changes: Partial<T>): Promise<number> {
    const idx = this.items.findIndex((i) => (i as any).id === id);
    if (idx >= 0) {
      this.items[idx] = { ...this.items[idx], ...changes };
      return 1;
    }
    return 0;
  }

  async delete(id: number): Promise<void> {
    this.items = this.items.filter((i) => (i as any).id !== id);
  }

  async clear(): Promise<void> {
    this.items = [];
  }

  async toArray(): Promise<T[]> {
    return [...this.items];
  }

  where(query: Record<string, any>) {
    const keys = Object.keys(query);
    const matches = (i: T) => keys.every((k) => (i as any)[k] === (query as any)[k]);
    const first = async (): Promise<T | undefined> =>
      this.items.find((i) => matches(i));
    const del = async (): Promise<void> => {
      this.items = this.items.filter((i) => !matches(i));
    };
    return { first, delete: del };
  }
}

export class FurnituremodelService {
  furnitureBodyPosition = new InMemoryTable<BodyFrontDetails>();
  furnitureBodys = new InMemoryTable<Body>();
  furnitureElement = new InMemoryTable<FrontElement>();

  // Observables not required in our tests; provide minimal stubs
  public getFurnitureBody() {
    return { subscribe: (_cb: any) => ({ unsubscribe() {} }) };
  }

  public getSelectedFurniture$() {
    return { subscribe: (_cb: any) => ({ unsubscribe() {} }) };
  }

  public setSelectedFurniture(_value: number) {
    // no-op
  }
}
