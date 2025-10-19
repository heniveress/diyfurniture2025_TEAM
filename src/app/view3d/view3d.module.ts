import { FurnituremodelModule } from './../furnituremodel/furnituremodel.module';
import { View3DComponent } from './view3d.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../material.module';



@NgModule({
  declarations: [
    View3DComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    FurnituremodelModule
  ]
})
export class View3DModule { }
