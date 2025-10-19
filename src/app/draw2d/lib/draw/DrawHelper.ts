import { NgIf } from '@angular/common';
import { Rectangle } from 'src/app/draw2d/lib/model/furniture-body.model';
export class DrawHelper {
  public static calculateRectangle(startX: number, startY: number, endX: number, endY: number):Rectangle{
    const rect : Rectangle = {
      posX: Math.min(startX, endX),
      posY: Math.min(startY, endY),
      width: Math.abs(startX - endX),
      height: Math.abs(startY - endY)
    };
    return rect;
  }
}

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}
