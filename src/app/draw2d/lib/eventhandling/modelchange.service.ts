import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export class Change{}
@Injectable({
  providedIn: 'root'
})
export class ModelchangeService {

  private _subject$ : Subject<Change> = new Subject();
  private _selectedElement$ : Subject<number> = new Subject();

  constructor() { }

  public get subject$(){
    return this._subject$;
  }

  modelChanged(){
    this._subject$.next(new Change());
  }

  selectedElement(id: number){
    this._selectedElement$.next(id);
  }

}
