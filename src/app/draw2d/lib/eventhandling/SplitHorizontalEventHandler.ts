import {
  FurnitureElement,
  FurnitureElementType,
  HorizontalSplit,
} from './../model/furniture-body.model';
import { Directive } from '@angular/core';
import { Rectangle } from 'src/app/draw2d/lib/model/furniture-body.model';
import { EventHandler } from './EventHandler';

@Directive()
export class SplitHorizontalEventHandler extends EventHandler {
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
        this.selectedElement.absoluteX,
        y,
        this.selectedElement.absoluteX + this.selectedElement.width,
        y
      );
      this.shouldDraw = false;
    }
  }
  public onMove(xPrev: number, yPrev: number, x: number, y: number): void {
    this.drawSupport.drawExistingElements();
    if (this.selectedElement != null) {
      if (
        this.selectedElement.absoluteY > y ||
        this.selectedElement.absoluteY + this.selectedElement.height < y
      ) {
        this.selectedElement = null;
        this.drawSupport.drawExistingElements();
        return;
      }
      this.drawSupport.setDrawColor('#F00');
      this.drawSupport.drawLine(
        this.selectedElement.absoluteX,
        y,
        this.selectedElement.absoluteX + this.selectedElement.width,
        y
      );
      this.shouldDraw = false;
    }
  }
  public onEnd(x: number, y: number): void {
    if (this.selectedElement != null) {
      const top = new FurnitureElement(
        0,
        0,
        this.selectedElement.width,
        Math.abs(y - this.selectedElement.absoluteY),
        FurnitureElementType.UNKNOWN,
        this.selectedElement
        );
      const bottom = new FurnitureElement(
        0,
        Math.abs(y - this.selectedElement.absoluteY),
        this.selectedElement.width,
        Math.abs(this.selectedElement.absoluteY + this.selectedElement.height - y),
        FurnitureElementType.UNKNOWN,
        this.selectedElement
      );
      const split = new HorizontalSplit(
        Math.abs(y - this.selectedElement.absoluteY),
        top,
        bottom
      );
      this.selectedElement.split = split;

      this.modelManager.refresh(this.selectedElement);

      this.selectedElement = null;
    }
  }
}
