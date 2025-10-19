import { Directive, EventEmitter, Output } from "@angular/core";
import { NgModel } from "@angular/forms";
import { Rectangle } from "./furniture-body.model";

@Directive()
export class SelectedRectangle {

  public constructor(private rectangle: Rectangle){
  }
  @Output() valueChanged = new EventEmitter();

  set posX(x: number){
    this.rectangle.posX = x;
    this.valueChanged.emit('posX');
  }
  get posX(){
    return this.rectangle.posX;
  }

  set posY(y: number){
    this.rectangle.posY = y;
    this.valueChanged.emit('posY');
  }
  get posY(){
    return this.rectangle.posY;
  }

  public get rect(){
    return this.rectangle;
  }
}
