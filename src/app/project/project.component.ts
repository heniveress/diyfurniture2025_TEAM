import { Component, OnInit } from '@angular/core';
import { Body } from '../furnituremodel/furnituremodels';
import { FurnituremodelService } from '../furnituremodel/furnituremodel.service';
import { BomItem, BomService } from '../services/bom.service';

@Component({
    selector: 'app-project',
    templateUrl: './project.component.html',
    styleUrls: ['./project.component.scss'],
    standalone: false
})
export class ProjectComponent implements OnInit {
    private bodies: Body[] = [];
    private selectedBody: number = 0;

    constructor(private furniture: FurnituremodelService, private bom: BomService) {}

    public displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];
    public dataSource: BomItem[] = [];

    ngOnInit(): void {
        this.loadBomForSelected();
    }

    private loadBomForSelected(): void {
        this.bom.getBomForProject().subscribe(items => {
            this.dataSource = items;
        });
    }
}