export interface Rectangle {
  posX: number;
  posY: number;
  width: number;
  height: number;
}

export enum FurnitureElementType {
  BODY,
  DRAWER,
  DOOR,
  UNKNOWN,
}

export enum FurnitureElementState {
  NEW,
  SYNCED,
  UPDATED,
  UNKNOWN,
}

export class SelectedFurniture implements Rectangle {
  constructor(
    public origin: FurnitureElement,
    public posX: number,
    public posY: number,
    public width: number,
    public height: number,
    public deepth: number,
    public thickness: number,
    public furnitureType: FurnitureElementType
  ) {}
}

export class FurnitureElement implements Rectangle {
  constructor(
    public posX: number,
    public posY: number,
    public width: number,
    public height: number,
    public type: FurnitureElementType,
    public parrent: FurnitureElement | null = null,
    public split: Split | null = null,
    public id: number = 0,
    public state: FurnitureElementState = FurnitureElementState.NEW
  ) {}

  public get absoluteX() : number {
    return this.parrent==null?this.posX:this.parrent.absoluteX+this.posX;
  }

  public get absoluteY() : number {
    return this.parrent==null?this.posY:this.parrent.absoluteY+this.posY;
  }

}

export class FurnitureBody extends FurnitureElement {
  constructor(
    posX: number,
    posY: number,
    width: number,
    height: number,
    public deepth: number,
    public thickness: number,
    type: FurnitureElementType,
    public x: number,
    public y: number,
    parrent: FurnitureElement | null = null,
    split: Split | null = null,
    id: number = 0
  ) {
    super(posX, posY, width, height, type, parrent, split,id);
  }

  public get absoluteX() : number {
    return this.x+this.posX;
  }

  public get absoluteY() : number {
    return this.y+this.posY;
  }

}

export class Split {}
export class HorizontalSplit extends Split {
  constructor(
    public relativePositionY: number,
    public topElement: FurnitureElement,
    public bottomElement: FurnitureElement
  ) {
    super();
  }
}

export class VerticalSplit extends Split {
  constructor(
    public relativePositionX: number,
    public leftElement: FurnitureElement,
    public rightElement: FurnitureElement
  ) {
    super();
  }
}
