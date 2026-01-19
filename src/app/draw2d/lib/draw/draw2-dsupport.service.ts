import { Observable, BehaviorSubject } from 'rxjs';
import { pairwise, switchMap, takeUntil } from 'rxjs/operators';
import {
  DiyFurnitureMouseEvent,
  MyMouseEventType,
} from 'src/app/draw2d/lib/model/my-mouse-event.model';
import { Injectable } from '@angular/core';
import { FurnitureModelManagerService } from '../model/furniture-model-manager.service';
import { Rectangle, SelectedFurniture } from 'src/app/draw2d/lib/model/furniture-body.model';

@Injectable()
export class Draw2DSupportService {

  constructor(private _modelManager: FurnitureModelManagerService){};
  public setModelManager(modelManager: FurnitureModelManagerService) {
    this._modelManager = modelManager;
  }
  private selectedElement$ : BehaviorSubject<SelectedFurniture | null> | null = null;
  private _cx: CanvasRenderingContext2D | null = null;
  private _canvas: HTMLCanvasElement | null = null;
  private _selectedElement: SelectedFurniture | null = null;
//  private _modelManager: FurnitureModelManagerService | null = null;

  public set selectedElement(elem: SelectedFurniture | null) {
    this._selectedElement = elem;
  }

  private get modelManager(): FurnitureModelManagerService {
    return this._modelManager
  }

  public get cx() {
    return this._cx == null ? new CanvasRenderingContext2D() : this._cx;
  }

  public get canvas() {
    return this._canvas == null ? new HTMLCanvasElement() : this._canvas;
  }

  setCanvas(canvas: HTMLCanvasElement): void {
    this._canvas = canvas;
    this._cx = canvas.getContext('2d');
  }

  init(selectedElement$ : BehaviorSubject<SelectedFurniture | null>) {
    this.cx.lineWidth = 1;
    this.cx.lineCap = 'round';
    this.cx.strokeStyle = '#000';
    this.selectedElement$ = selectedElement$;
    selectedElement$.subscribe((event)=>{
      this._selectedElement = event;
    });
  }

  public changeSelectedElement(element: SelectedFurniture | null): void{
    this.selectedElement$?.next(element);
  }

  public drawExistingElements(): void {
    this.cx.beginPath();
    var size = this.toCanvas(this.cx.canvas.width, this.cx.canvas.height);
    this.cx.clearRect(-599, -599, size.x * 10, size.y * 10);
    for (var furnitureBody of this.modelManager.getViewFurnitures()) {
      furnitureBody.draw(0,0,this);
    }
  }

  private toCanvas(x: number, y: number) {
    var matrix = this.cx.getTransform();
    var point = new DOMPoint(x, y);
    return point.matrixTransform(matrix);
  }

  public drawLine(
    startPosX: number,
    startPosY: number,
    endPosX: number,
    endPosY: number
  ): void {
    this.cx.beginPath();
    this.cx.moveTo(startPosX, startPosY);
    this.cx.lineTo(endPosX, endPosY);
    this.cx.stroke();
  }

  public setDrawColor(color: string): void {
    this.cx.strokeStyle = color;
  }

  public clearScrean(): void {
    this.cx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  public translatePage(x: number, y: number): void {
    this.cx.translate(x, y);
  }

  public drawRectangle(rectangle: Rectangle): void {
    const element = rectangle as any;
    const materialColor = this.getMaterialColor(element.material);

    this.cx.beginPath();
    this.cx.strokeStyle = (materialColor && materialColor !== 'transparent') ? materialColor : '#000';
    this.cx.lineWidth = 3;
    this.cx.strokeRect(rectangle.posX, rectangle.posY, rectangle.width, rectangle.height);
  }

  private getMaterialColor(material: string | undefined): string {
    switch(material) {
      case 'oak': return '#8b4513';
      case 'pine': return '#deb887';
      case 'beech': return '#cd853f';
      case 'walnut': return '#5d3a1a';
      case 'maple': return '#f4a460';

      case 'white': return '#ffffff';
      case 'antracite': return '#2f4f4f';
      case 'lightgray': return '#d3d3d3';
      case 'black': return '#1a1a1a';

      default: return 'transparent';
    }
  }

  public drawDimensions(rect: Rectangle): void {
    const offset = 25;
    const tickSize = 5;
    
    this.cx.save();
    this.cx.beginPath();
    this.cx.strokeStyle = '#ff00ff';
    this.cx.fillStyle = '#ff00ff';
    this.cx.font = 'bold 12px Arial';
    this.cx.lineWidth = 1;

    const yPos = rect.posY - offset;
    this.drawLine(rect.posX, yPos, rect.posX + rect.width, yPos);
    this.drawLine(rect.posX, yPos - tickSize, rect.posX, yPos + tickSize);
    this.drawLine(rect.posX + rect.width, yPos - tickSize, rect.posX + rect.width, yPos + tickSize);
    const widthText = `${Math.round(rect.width * 10)} mm`;
    this.cx.fillText(widthText, rect.posX + (rect.width / 2) - 20, yPos - 8);

    const xPos = rect.posX - offset;
    this.drawLine(xPos, rect.posY, xPos, rect.posY + rect.height);
    this.drawLine(xPos - tickSize, rect.posY, xPos + tickSize, rect.posY);
    this.drawLine(xPos - tickSize, rect.posY + rect.height, xPos + tickSize, rect.posY + rect.height);
    
    const heightText = `${Math.round(rect.height * 10)} mm`;
    this.cx.save();
    this.cx.translate(xPos - 8, rect.posY + (rect.height / 2) + 20);
    this.cx.rotate(-Math.PI / 2);
    this.cx.fillText(heightText, 0, 0);
    this.cx.restore();

    this.cx.restore();
  }
}


