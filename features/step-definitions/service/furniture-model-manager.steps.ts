import { Given, When, Then, Before } from '@cucumber/cucumber';
import assert from 'assert';

// Domain imports
import {
  FurnitureModelManagerService,
} from '../../../src/app/draw2d/lib/model/furniture-model-manager.service';
import {
  FurnitureBody,
  FurnitureElement,
  FurnitureElementType,
  VerticalSplit,
} from '../../../src/app/draw2d/lib/model/furniture-body.model';
import {
  Body,
  BodyFrontDetails,
  FrontElement,
} from '../../../src/app/furnituremodel/furnituremodels';
import { ModelchangeService } from '../../../src/app/draw2d/lib/eventhandling/modelchange.service';

// Minimal in-memory Dexie-like table to support the service without a browser environment
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
    const first = async () =>
      this.items.find((i) => keys.every((k) => (i as any)[k] === (query as any)[k]));
    return { first };
  }
}

// Fake FurnituremodelService to satisfy constructor dependencies without Dexie/Browser
class FakeFurnituremodelService {
  furnitureBodyPosition = new InMemoryTable<BodyFrontDetails>();
  furnitureBodys = new InMemoryTable<Body>();
  furnitureElement = new InMemoryTable<FrontElement>();

  // Only used via setSelectedFurniture in the manager; no-op for tests
  setSelectedFurniture(_value: number) {
    /* no-op */
  }
}

type SplitResult = { element: FurnitureElement; split: VerticalSplit } | null;

interface TestContext {
  service: FurnitureModelManagerService;
  furnitureSvc: FakeFurnituremodelService;
  modelChange: ModelchangeService;
  lastBody?: FurnitureBody;
  leftElem?: FurnitureElement;
  rightElem?: FurnitureElement;
  lastSplitResult?: SplitResult;
  modelChangeNotified?: boolean;
}

const ctx: TestContext = {} as any;

Before(() => {
  // Reset context before each scenario
  ctx.furnitureSvc = new FakeFurnituremodelService();
  ctx.modelChange = new ModelchangeService();
  ctx.service = new FurnitureModelManagerService(ctx.furnitureSvc as any, ctx.modelChange);
  ctx.lastBody = undefined;
  ctx.leftElem = undefined;
  ctx.rightElem = undefined;
  ctx.lastSplitResult = undefined;
  ctx.modelChangeNotified = false;
});

Given('a FurnitureModelManagerService with no existing data', function () {
  // Already initialized in Before hook
  assert.ok(ctx.service);
});

Given(
  'a body of width {int} and height {int} at position {int},{int}',
  function (width: number, height: number, worldX: number, worldY: number) {
    // posX/posY are local to the element; x/y are world offsets for FurnitureBody
    const body = new FurnitureBody(
      0, // posX
      0, // posY
      width,
      height,
      0, // deepth
      0, // thickness
      FurnitureElementType.BODY,
      worldX, // x (world)
      worldY, // y (world)
      null,
      null,
      0
    );
    ctx.lastBody = body;
    ctx.service.addFurnitureBody(body);
  }
);

Given(
  'the body has a vertical split at x = {int} with left element width {int} and right element width {int}',
  function (splitX: number, leftWidth: number, rightWidth: number) {
    assert.ok(ctx.lastBody, 'Body must exist before adding a split');
    const body = ctx.lastBody!;

    const left = new FurnitureElement(
      0, // posX
      0, // posY
      leftWidth,
      body.height,
      FurnitureElementType.DOOR,
      body
    );

    const right = new FurnitureElement(
      splitX, // posX starts at splitX
      0,
      rightWidth,
      body.height,
      FurnitureElementType.DRAWER,
      body
    );

    body.split = new VerticalSplit(splitX, left, right);
    ctx.leftElem = left;
    ctx.rightElem = right;
  }
);

When('I search for a split near x = {int} and y = {int}', function (x: number, y: number) {
  // Convert the provided coordinates to world space using the last body if present
  const worldX = ctx.lastBody ? ctx.lastBody.x + x : x;
  const worldY = ctx.lastBody ? ctx.lastBody.y + y : y;
  ctx.lastSplitResult = ctx.service.findSelectedSplit(worldX, worldY) as SplitResult;
});

Then('I should detect a vertical split for that body', function () {
  assert.ok(ctx.lastSplitResult, 'Expected to detect a split but found none');
  assert.ok(ctx.lastSplitResult!.split instanceof VerticalSplit, 'Expected a vertical split');
  if (ctx.lastBody) {
    assert.strictEqual(ctx.lastSplitResult!.element, ctx.lastBody);
  }
});

When('I resize the left element to new width {int}', function (newWidth: number) {
  assert.ok(ctx.leftElem, 'Left element must be defined to resize');
  ctx.service.resizeElementWidthNoOverlap(ctx.leftElem!, newWidth);
});

Then('the split x should be {int}', function (expected: number) {
  assert.ok(ctx.lastBody && ctx.lastBody.split instanceof VerticalSplit, 'Expected a vertical split on the body');
  const split = ctx.lastBody!.split as VerticalSplit;
  assert.strictEqual(Math.round(split.relativePositionX), expected);
});

Then('the left element width should be {int}', function (expected: number) {
  assert.ok(ctx.leftElem, 'Left element missing');
  assert.strictEqual(Math.round(ctx.leftElem!.width), expected);
});

Then('the right element width should be {int}', function (expected: number) {
  assert.ok(ctx.rightElem, 'Right element missing');
  assert.strictEqual(Math.round(ctx.rightElem!.width), expected);
});

When('I clear all elements', function () {
  // Subscribe to change notifications
  ctx.modelChange.subject$.subscribe(() => {
    ctx.modelChangeNotified = true;
  });
  ctx.service.clearAllElements();
});

Then('there should be {int} furniture bodies', function (expected: number) {
  const count = ctx.service.getFurnitureBodies().length;
  assert.strictEqual(count, expected);
});

Then('model change should have been notified', function () {
  assert.strictEqual(ctx.modelChangeNotified, true);
});
