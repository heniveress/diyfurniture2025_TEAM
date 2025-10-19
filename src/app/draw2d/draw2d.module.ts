import { FurnituremodelModule } from './../furnituremodel/furnituremodel.module';
import { Draw2dComponent } from './draw2d.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../material.module';



@NgModule({
  declarations: [
    Draw2dComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    MaterialModule,
    FurnituremodelModule
  ]
})
export class Draw2dModule { }
