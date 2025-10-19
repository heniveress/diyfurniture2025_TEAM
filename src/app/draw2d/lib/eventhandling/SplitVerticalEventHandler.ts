import {
  FurnitureElement,
  FurnitureElementType,
  VerticalSplit,
} from './../model/furniture-body.model';
import { Directive } from '@angular/core';
import { Rectangle } from 'src/app/draw2d/lib/model/furniture-body.model';
import { EventHandler } from './EventHandler';

@Directive()
export class SplitVerticalEventHandler extends EventHandler {
  private selectedElement: FurnitureElement | null = null;
  private shouldDraw: boolean = true;
  public onInit(): void {
    this.shouldDraw = true;
    this.drawSupport.clearScrean();
  }
  public onFinsish(): void {
    if (this.shouldDraw) this.drawSupport.drawExistingElements();
  }

  public onStart(x: number, y: number): void {
    this.selectedElement = this.modelManager.findSelectedElement(x, y);
    this.drawSupport.drawExistingElements();
    if (this.selectedElement != undefined) {
      this.drawSupport.setDrawColor('#F00');
      this.drawSupport.drawLine(
        x,
        this.selectedElement.absoluteY,
        x,
        this.selectedElement.absoluteY + this.selectedElement.height
      );
      this.shouldDraw = false;
    }
  }
  public onMove(xPrev: number, yPrev: number, x: number, y: number): void {
    this.drawSupport.drawExistingElements();
    if (this.selectedElement != null) {
      if (
        this.selectedElement.absoluteX > x ||
        this.selectedElement.absoluteX + this.selectedElement.width < x
      ) {
        this.selectedElement = null;
        this.drawSupport.drawExistingElements();
        return;
      }
      this.drawSupport.setDrawColor('#F00');
      this.drawSupport.drawLine(
        x,
        this.selectedElement.absoluteY,
        x,
        this.selectedElement.absoluteY + this.selectedElement.height
      );
      this.shouldDraw = false;
    }
  }
  public onEnd(x: number, y: number): void {
    if (this.selectedElement != null) {
      const left = new FurnitureElement(
        0,
        0,
        Math.abs(x - this.selectedElement.absoluteX),
        this.selectedElement.height,
        FurnitureElementType.UNKNOWN,
        this.selectedElement,
        null
      );
      const right = new FurnitureElement(
        Math.abs(x - this.selectedElement.absoluteX),
        0,
        Math.abs(
          this.selectedElement.absoluteX + this.selectedElement.width - x
        ),
        this.selectedElement.height,
        FurnitureElementType.UNKNOWN,
        this.selectedElement,
        null
      );
      const split = new VerticalSplit(
        Math.abs(x - this.selectedElement.absoluteX),
        left,
        right
      );
      this.selectedElement.split = split;

      this.modelManager.refresh(this.selectedElement);
      this.selectedElement = null;
    }
  }
}
