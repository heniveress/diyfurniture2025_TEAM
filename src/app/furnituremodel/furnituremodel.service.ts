import { Dexie, liveQuery, Table } from 'dexie';
import { Injectable } from '@angular/core';
import { Body, BodyFrontDetails, FrontElement } from './furnituremodels';
import { LocalStorageService } from 'ngx-webstorage';

@Injectable({
  providedIn: 'root',
})
export class FurnituremodelService extends Dexie {
  furnitureBodyPosition!: Table<BodyFrontDetails, number>;
  furnitureBodys!: Table<Body, number>;
  furnitureElement!:Table<FrontElement, number>;
  constructor(private sessionStore: LocalStorageService) {
    super('furnitureStore');
    this.version(3).stores({
      furnitureBodys: '++id',
      furnitureBodyPosition: '++id, bodyId',
      furnitureElement: '++id, bodyId'
    });
  }

  public getFurnitureBody() {
    return liveQuery(() => this.furnitureBodys.toArray());
  }

  public getSelectedFurniture$(){
    return this.sessionStore.observe('selected');
  }

  public setSelectedFurniture(value: number){
    this.sessionStore.store('selected',value);
  }
}
