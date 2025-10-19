export class Body {
  constructor(public name: string, public width: number, public height: number, public deepth: number, public thickness: number, public frontElements: FrontElement[],public id?: number){};
}

export class BodyFrontDetails {
  constructor(public bodyId: number, public x: number, public y: number, public details: any, public id?: number){};
}

export class FrontElement {
  constructor(
  public bodyId: number,
  public elementType: string,
  public x: number,
  public y: number,
  public width: number,
  public height: number,
  public details?: any,
  public id?: number){};
}
