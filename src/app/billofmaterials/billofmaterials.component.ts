import { Body } from './../furnituremodel/furnituremodels';
import { Component, OnInit } from '@angular/core';
import {MatTableModule} from '@angular/material/table';
import { FurnituremodelService} from '../furnituremodel/furnituremodel.service';
import { BomItem, BomService } from '../services/bom.service';

export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
  {position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H'},
  {position: 2, name: 'Helium', weight: 4.0026, symbol: 'He'},
  {position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li'},
];

@Component({
    selector: 'app-billofmaterials',
    templateUrl: './billofmaterials.component.html',
    styleUrls: ['./billofmaterials.component.scss'],
    standalone: false
})
export class BillofmaterialsComponent implements OnInit {

  private bodies: Body[] = [];
  private selectedBody : number = 0;

  constructor(private furniture: FurnituremodelService, private bom: BomService) {}

  public displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];
  public dataSource: BomItem[] = [];

  ngOnInit(): void {
    this.loadBomForSelected();
    // this.furniture.getFurnitureBody().subscribe((bodies) => {
    //   if (bodies.length < 1)
    //     return;
    //   this.bodies = bodies;
    //   let body = bodies[this.selectedBody];
    // });
    // this.furniture.getSelectedFurniture$().subscribe(id=>{
    //   if(typeof id ==='number'){
    //     this.selectedBody = <number>id;
    //     const selectedElem = this.bodies.find(el=> el.id==this.selectedBody);
    //     if(selectedElem==null)
    //       return;
    //   }
    // });
  }

  private loadBomForSelected(): void {
    this.bom.getBoms().subscribe(items => {
      this.dataSource = items ?? [];
    });
  }
}
