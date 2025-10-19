import { FurnitureElementType } from './../model/furniture-body.model';
import { Directive } from '@angular/core';
import { FurnitureElement, Rectangle, SelectedFurniture } from 'src/app/draw2d/lib/model/furniture-body.model';
import { EventHandler } from './EventHandler';

@Directive()
export class SelectEventHandler extends EventHandler {
  private selectedElement: SelectedFurniture | null = null;

  public onInit(): void {
    this.drawSupport.setDrawColor('#000');
  }
  public onFinsish(): void {
    this.drawSupport.drawExistingElements();
  }
  public onStart(x: number, y: number): void {
    const selectedElement = this.modelManager.findSelectedElement(x, y);
    const elem = convertElement(selectedElement);
    const parrent = SelectEventHandler.findParrent(selectedElement);
    this.drawSupport.changeSelectedElement(elem);
    this.modelManager.setSelectedElement(parrent!=null?parrent.id:0);
  }
  public onMove(xPrev: number, yPrev: number, x: number, y: number): void {}
  public onEnd(x: number, y: number): void {}

  private static findParrent(element: FurnitureElement | null) : FurnitureElement | null {
    if(element==null || element.parrent==null)
    return element;
    return this.findParrent(element.parrent);
  }
}
function convertElement(selectedElement: FurnitureElement | null) {
  if(selectedElement==null)
    return null;
  return new SelectedFurniture(selectedElement,selectedElement.posX,selectedElement.posY,selectedElement.width,selectedElement.height,600,18,selectedElement.type);
}

