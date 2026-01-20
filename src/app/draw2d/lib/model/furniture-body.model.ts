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
    public furnitureType: FurnitureElementType,
    public material: string = 'pine'
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
    public state: FurnitureElementState = FurnitureElementState.NEW,
    public material: string = 'pine'
  ) {}

  public draw(x: number, y: number, drawSupport: any): void {
    const rectToDraw = {
      posX: this.absoluteX,
      posY: this.absoluteY,
      width: this.width,
      height: this.height,
      material: this.material
    };

    drawSupport.drawRectangle(rectToDraw);

    if (this.split instanceof HorizontalSplit) {
      this.split.topElement.draw(x, y, drawSupport);
      this.split.bottomElement.draw(x, y, drawSupport);
    } else if (this.split instanceof VerticalSplit) {
      this.split.leftElement.draw(x, y, drawSupport);
      this.split.rightElement.draw(x, y, drawSupport);
    }
  }

  public get absoluteX() : number {
    return this.parrent==null?this.posX:this.parrent.absoluteX+this.posX;
  }

  public get absoluteY() : number {
    return this.parrent==null?this.posY:this.parrent.absoluteY+this.posY;
  }
}

export class FurnitureBody extends FurnitureElement {
  // ÚJ MEZŐ: Ide töltjük be a JSON-ből visszaalakított belső szerkezetet
  public model: any = null; 

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
    id: number = 0,
    material: string = 'pine'
  ) {
    super(posX, posY, width, height, type, parrent, split, id, FurnitureElementState.NEW, material);
    // A konstruktorban inicializáljuk a modelt a kiinduló állapottal
    this.model = this; 
  }

  // A getterek most már tökéletesek, a világkoordinátát (x,y) 
  // és a relatív eltolást (posX, posY) is figyelembe veszik.
  public override get absoluteX(): number {
    return Number(this.x) + Number(this.posX);
  }

  public override get absoluteY(): number {
    return Number(this.y) + Number(this.posY);
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
