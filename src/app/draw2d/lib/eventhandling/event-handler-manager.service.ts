import { Injectable } from '@angular/core';
import {
  DiyFurnitureMouseEvent,
  MyMouseEventType,
} from 'src/app/draw2d/lib/model/my-mouse-event.model';
import { RectangeDrawEventHandler } from './RectangeDrawEventHandler';
import { MoveEventHandler } from './MoveEventHandler';
import { SplitVerticalEventHandler } from './SplitVerticalEventHandler';
import { SplitHorizontalEventHandler } from './SplitHorizontalEventHandler';
import { SelectEventHandler } from './SelectEventHandler';
import { EventHandler } from './EventHandler';
import { FurnitureModelManagerService } from '../model/furniture-model-manager.service';
import { Draw2DSupportService } from '../draw/draw2-dsupport.service';

@Injectable()
export class EventHandlerManagerService {
  drawSupport: Draw2DSupportService | null = null;
  modelManager: FurnitureModelManagerService | null = null;

  private _actionType: string = 'crop_square';

  public set actionType(actionType: string) {
    this._actionType = actionType;
  }

  private actionHandlerCreators: Map<
    string,
    (
      drawSupport: Draw2DSupportService,
      modelManager: FurnitureModelManagerService
    ) => EventHandler
  > = new Map([
    [
      'crop_square',
      (
        drawSupport: Draw2DSupportService,
        modelManager: FurnitureModelManagerService
      ): EventHandler => {
        return new RectangeDrawEventHandler(drawSupport, modelManager);
      },
    ],
    [
      'move',
      (
        drawSupport: Draw2DSupportService,
        modelManager: FurnitureModelManagerService
      ): EventHandler => {
        return new MoveEventHandler(drawSupport, modelManager);
      },
    ],
    [
      'split_rectangle_vertical',
      (
        drawSupport: Draw2DSupportService,
        modelManager: FurnitureModelManagerService
      ): EventHandler => {
        return new SplitVerticalEventHandler(drawSupport, modelManager);
      },
    ],
    [
      'split_rectangle_horizontal',
      (
        drawSupport: Draw2DSupportService,
        modelManager: FurnitureModelManagerService
      ): EventHandler => {
        return new SplitHorizontalEventHandler(drawSupport, modelManager);
      },
    ],
    [
      'select',
      (
        drawSupport: Draw2DSupportService,
        modelManager: FurnitureModelManagerService
      ): EventHandler => {
        return new SelectEventHandler(drawSupport, modelManager);
      },
    ],
  ]);

  private actionHandlers: Map<string, EventHandler> = new Map();

  public initServices(
    drawSupport: Draw2DSupportService,
    modelManager: FurnitureModelManagerService
  ): void {
    this.drawSupport = drawSupport;
    this.modelManager = modelManager;
  }

  public onEvent(mouseEvent: DiyFurnitureMouseEvent): void {
    const handler = this.getEventHandler(this._actionType);
    handler.onInit();
    switch (mouseEvent.type) {
      case MyMouseEventType.START:
        handler.onStart(mouseEvent.x1, mouseEvent.y1);
        break;
      case MyMouseEventType.MOVE:
        handler.onMove(
          mouseEvent.x1,
          mouseEvent.y1,
          mouseEvent.x2,
          mouseEvent.y2
        );
        break;
      case MyMouseEventType.END:
        handler.onEnd(mouseEvent.x1, mouseEvent.y1);
        handler.onFinsish();
        break;
    }
  }

  getEventHandler(actionType: string): EventHandler {
    var handler = this.actionHandlers.get(actionType);
    if (handler === undefined) {
      const creator = this.actionHandlerCreators.get(actionType);
      if (creator === undefined) {
        throw new Error('The action is not defined');
      }
      if (this.drawSupport == null || this.modelManager == null) {
        throw new Error('The service is not initialized properly');
      }
      handler = creator(this.drawSupport, this.modelManager);
      this.actionHandlers.set(actionType, handler);
    }
    return handler;
  }
  constructor() {}
}
