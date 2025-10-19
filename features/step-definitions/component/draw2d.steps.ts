import { Before, Given, When, Then } from '@cucumber/cucumber';
import assert from 'assert';

// SUT and domain imports
import { Draw2dComponent } from '../../../src/app/draw2d/draw2d.component';
import {
  FurnitureElement,
  FurnitureElementType,
  FurnitureBody,
  SelectedFurniture,
} from '../../../src/app/draw2d/lib/model/furniture-body.model';

// Test doubles for services used by Draw2dComponent
class MockModelManager {
  removeElementCalls = 0;
  clearAllElementsCalls = 0;
  refreshCalls = 0;
  resizeWidthCalls: Array<{ element: FurnitureElement; width: number }> = [];
  resizeHeightCalls: Array<{ element: FurnitureElement; height: number }> = [];

  refresh(_element: FurnitureElement) {
    this.refreshCalls++;
  }

  resizeElementWidthNoOverlap(element: FurnitureElement, newWidth: number) {
    // Simulate model logic by setting the origin width to the requested width
    element.width = newWidth;
    this.resizeWidthCalls.push({ element, width: newWidth });
  }

  resizeElementHeightPreservingPercent(element: FurnitureElement, newHeight: number) {
    // Simulate model logic by setting the origin height to the requested height
    element.height = newHeight;
    this.resizeHeightCalls.push({ element, height: newHeight });
  }

  removeElement(_element: FurnitureElement) {
    this.removeElementCalls++;
  }

  clearAllElements() {
    this.clearAllElementsCalls++;
  }

  findBody(element: FurnitureElement) {
    // Return a dummy body as parent if requested by some flows
    return new FurnitureBody(0, 0, element.width, element.height, 0, 0, FurnitureElementType.BODY, 0, 0, null, null, 0);
  }
}

class MockDrawSupport {
  drawCalls = 0;
  drawExistingElements() {
    this.drawCalls++;
  }
  setCanvas(_c: any) {}
  setModelManager(_m: any) {}
  init(_selected$: any) {}
}

class MockEventHandler {
  actionType: string = '';
  initServices(_drawSupport: any, _modelManager: any) {}
  onEvent(_event: any) {}
}

class MockEventTranslate {
  setCanvas(_c: any) {}
  init() {}
  mouseEvents$ = { subscribe: (_cb: any) => ({ unsubscribe() {} }) };
}

class MockModelChange {
  subject$ = { subscribe: (_cb: any) => ({ unsubscribe() {} }) };
  modelChanged() {}
}

// Test context shared across steps
interface TestContext {
  comp: Draw2dComponent;
  model: MockModelManager;
  draw: MockDrawSupport;
  handler: MockEventHandler;
  translate: MockEventTranslate;
  change: MockModelChange;
  origin?: FurnitureElement;
  selected?: SelectedFurniture;
  body?: FurnitureBody;
}

const ctx: TestContext = {} as any;

Before(() => {
  ctx.model = new MockModelManager();
  ctx.draw = new MockDrawSupport();
  ctx.handler = new MockEventHandler();
  ctx.translate = new MockEventTranslate();
  ctx.change = new MockModelChange();

  // Create component with mocked services
  ctx.comp = new Draw2dComponent(
    ctx.model as any,
    ctx.draw as any,
    ctx.translate as any,
    ctx.handler as any,
    ctx.change as any
  );

  // Provide a lightweight subscription so that using the selectedElement setter
  // updates the private _selectedElement similarly to runtime behaviour
  const anyComp = ctx.comp as any;
  if (anyComp.selectedElement$ && typeof anyComp.selectedElement$.subscribe === 'function') {
    anyComp.selectedElement$.subscribe((ev: SelectedFurniture | null) => {
      anyComp._selectedElement = ev;
    });
  }
});

Given('a fresh Draw2dComponent with mocked services', function () {
  assert.ok(ctx.comp);
});

When('I change the draw action to {string}', function (action: string) {
  ctx.comp.onDrawActionChange(action);
});

Then('the component figureType should be {string}', function (expected: string) {
  assert.strictEqual(ctx.comp.figureType, expected);
});

Then('the event handler actionType should be {string}', function (expected: string) {
  assert.strictEqual(ctx.handler.actionType, expected);
});

Given('a selected element exists', function () {
  // Create an origin element and wrap it in SelectedFurniture
  ctx.origin = new FurnitureElement(0, 0, 30, 50, FurnitureElementType.DOOR, null);
  ctx.selected = new SelectedFurniture(ctx.origin, 0, 0, ctx.origin.width, ctx.origin.height, 0, 0, ctx.origin.type);
  // Use the setter (wires through our subscription to sync private state)
  ctx.comp.selectedElement = ctx.selected;
  // Ensure getter returns our selected
  assert.ok(ctx.comp.selectedElement);
});

Given('a selected body exists', function () {
  ctx.body = new FurnitureBody(0, 0, 100, 100, 0, 0, FurnitureElementType.BODY, 0, 0, null, null, 0);
  ctx.comp.selectedElementBody = ctx.body;
  assert.ok(ctx.comp.selectedElementBody);
});

When('I delete the selected element', function () {
  ctx.comp.deleteSelectedElement();
});

Then('modelManager.removeElement should have been called once', function () {
  assert.strictEqual(ctx.model.removeElementCalls, 1);
});

Then('the selection should be cleared', function () {
  // selectedElement setter pushes null; our subscription updates private field
  assert.strictEqual(ctx.comp.selectedElement, null);
  assert.strictEqual(ctx.comp.selectedElementBody, null);
});

Then('draw support should redraw', function () {
  assert.ok(ctx.draw.drawCalls >= 1);
});

When('I clear all elements in the component', function () {
  ctx.comp.clearAllElements();
});

Then('modelManager.clearAllElements should have been called once', function () {
  assert.strictEqual(ctx.model.clearAllElementsCalls, 1);
});

When('I select front type {string}', function (value: string) {
  // Provide a minimal MatSelectChange-like object
  const change: any = { value };
  // Ensure we have a selected element; if not, create one
  if (!ctx.comp.selectedElement) {
    ctx.origin = new FurnitureElement(0, 0, 30, 50, FurnitureElementType.DOOR, null);
    ctx.selected = new SelectedFurniture(ctx.origin, 0, 0, ctx.origin.width, ctx.origin.height, 0, 0, ctx.origin.type);
    ctx.comp.selectedElement = ctx.selected;
  }
  ctx.comp.selectFrontType(change);
});

Then('the selected element origin type should be DOOR', function () {
  assert.ok(ctx.comp.selectedElement);
  assert.strictEqual(ctx.comp.selectedElement!.origin.type, FurnitureElementType.DOOR);
});

Then('the selected element furnitureType should be DOOR', function () {
  assert.ok(ctx.comp.selectedElement);
  assert.strictEqual(ctx.comp.selectedElement!.furnitureType, FurnitureElementType.DOOR);
});

Then('modelManager.refresh should have been called once', function () {
  assert.strictEqual(ctx.model.refreshCalls, 1);
});

Given('a selected element exists with width {int} and height {int}', function (w: number, h: number) {
  ctx.origin = new FurnitureElement(0, 0, w, h, FurnitureElementType.DOOR, null);
  ctx.selected = new SelectedFurniture(ctx.origin, 0, 0, w, h, 0, 0, ctx.origin.type);
  ctx.comp.selectedElement = ctx.selected;
});

Given('the origin element actual width will be adjusted to {int} by the model', function (_newWidth: number) {
  // Our mock resize method already sets origin.width = newWidth when called; nothing else needed here.
});

When('I change selected element size to width {int} and height {int}', function (w: number, h: number) {
  assert.ok(ctx.comp.selectedElement);
  ctx.comp.selectedElement!.width = w;
  ctx.comp.selectedElement!.height = h;
  ctx.comp.onSelectedElementSizeChanged();
});

Then('modelManager.resizeElementWidthNoOverlap should have been called with width {int}', function (expected: number) {
  const last = ctx.model.resizeWidthCalls[ctx.model.resizeWidthCalls.length - 1];
  assert.ok(last, 'No width resize call recorded');
  assert.strictEqual(Math.round(last.width), expected);
});

Then('the selected width should sync to the origin width {int}', function (expected: number) {
  assert.ok(ctx.comp.selectedElement);
  assert.strictEqual(Math.round(ctx.comp.selectedElement!.width), expected);
  assert.strictEqual(Math.round(ctx.origin!.width), expected);
});

Given('the origin element actual height will be adjusted to {int} by the model', function (_newHeight: number) {
  // Our mock resize method already sets origin.height = newHeight when called; nothing else needed here.
});

Then('modelManager.resizeElementHeightPreservingPercent should have been called with height {int}', function (expected: number) {
  const last = ctx.model.resizeHeightCalls[ctx.model.resizeHeightCalls.length - 1];
  assert.ok(last, 'No height resize call recorded');
  assert.strictEqual(Math.round(last.height), expected);
});

Then('the selected height should sync to the origin height {int}', function (expected: number) {
  assert.ok(ctx.comp.selectedElement);
  assert.strictEqual(Math.round(ctx.comp.selectedElement!.height), expected);
  assert.strictEqual(Math.round(ctx.origin!.height), expected);
});
