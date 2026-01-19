import { Directive } from '@angular/core';
import { Rectangle, FurnitureElement, HorizontalSplit, VerticalSplit, FurnitureBody } from 'src/app/draw2d/lib/model/furniture-body.model';
import { EventHandler } from './EventHandler';

@Directive()
export class MoveEventHandler extends EventHandler {
  private selectedElement: Rectangle | null = null;
  private selectedSplit: { element: FurnitureElement, split: HorizontalSplit | VerticalSplit } | null = null;
  private isDragging: boolean = false;
  private dragStartX: number = 0;
  private dragStartY: number = 0;
  private originalElementX: number = 0;
  private originalElementY: number = 0;
  private originalSplitPosition: number = 0;

  public onInit(): void {
    this.drawSupport.setDrawColor('#000');
    this.drawSupport.drawExistingElements();
  }

  public onFinsish(): void {
    this.isDragging = false;
    this.selectedElement = null;
    this.selectedSplit = null;
  }

  public onStart(x: number, y: number): void {
    console.log('[MOVE] onStart called with coordinates:', { x, y });

    // First try to find a split line (horizontal or vertical)
    this.selectedSplit = this.modelManager.findSelectedSplit(x, y);
    console.log('[MOVE] Split detection result:', this.selectedSplit);

    if (this.selectedSplit) {
      this.isDragging = true;
      this.dragStartX = x;
      this.dragStartY = y;

      // Store the original split position
      if (this.selectedSplit.split instanceof HorizontalSplit) {
        this.originalSplitPosition = this.selectedSplit.split.relativePositionY;
        console.log('[MOVE] Starting horizontal split drag, original position:', this.originalSplitPosition);
      } else if (this.selectedSplit.split instanceof VerticalSplit) {
        this.originalSplitPosition = this.selectedSplit.split.relativePositionX;
        console.log('[MOVE] Starting vertical split drag, original position:', this.originalSplitPosition);
      }
    } else {
      // If no split found, try to find a regular element
      const hitElement = this.modelManager.findSelectedElement(x, y);
      console.log('[MOVE] Element detection result:', hitElement);

      // Move the ROOT furniture body when clicking anywhere inside it (including inner elements)
      if (hitElement) {
        const body = this.modelManager.findBody(hitElement as FurnitureElement);
        this.selectedElement = body;
        this.isDragging = true;
        this.dragStartX = x;
        this.dragStartY = y;
        this.originalElementX = this.selectedElement.posX;
        this.originalElementY = this.selectedElement.posY;
        console.log('[MOVE] Starting FURNITURE BODY drag, original position:', { x: this.originalElementX, y: this.originalElementY });
      } else {
        this.selectedElement = null;
        this.isDragging = false;
      }
    }

    console.log('[MOVE] Drag state after onStart:', { isDragging: this.isDragging, selectedSplit: !!this.selectedSplit, selectedElement: !!this.selectedElement });
    this.drawSupport.drawExistingElements();
  }

  public onMove(xPrev: number, yPrev: number, x: number, y: number): void {
    console.log('[MOVE] onMove called:', { xPrev, yPrev, x, y, isDragging: this.isDragging });

    const gridSize = 3;

    if (this.selectedSplit && this.isDragging) {
      const deltaX = x - this.dragStartX;
      const deltaY = y - this.dragStartY;

      if (this.selectedSplit.split instanceof HorizontalSplit) {
        let rawPosition = this.originalSplitPosition + deltaY;
        const newPosition = Math.max(5, Math.min(
          this.selectedSplit.element.height - 5,
          Math.round(rawPosition / gridSize) * gridSize
        ));
        
        this.selectedSplit.split.relativePositionY = newPosition;

        const split = this.selectedSplit.split;
        const element = this.selectedSplit.element;
        split.topElement.height = newPosition;
        split.bottomElement.posY = newPosition;
        split.bottomElement.height = element.height - newPosition;

      } else if (this.selectedSplit.split instanceof VerticalSplit) {
        let rawPosition = this.originalSplitPosition + deltaX;
        const newPosition = Math.max(5, Math.min(
          this.selectedSplit.element.width - 5,
          Math.round(rawPosition / gridSize) * gridSize
        ));

        this.selectedSplit.split.relativePositionX = newPosition;

        const split = this.selectedSplit.split;
        const element = this.selectedSplit.element;
        split.leftElement.width = newPosition;
        split.rightElement.posX = newPosition;
        split.rightElement.width = element.width - newPosition;
      }

      this.normalizeLayout(this.selectedSplit.element);
      this.modelManager.refresh(this.selectedSplit.element);
      this.drawSupport.drawExistingElements();

    } else if (this.selectedElement && this.isDragging) {
      const deltaX = x - this.dragStartX;
      const deltaY = y - this.dragStartY;

      let newPosX = this.originalElementX + deltaX;
      let newPosY = this.originalElementY + deltaY;

      this.selectedElement.posX = Math.round(newPosX / gridSize) * gridSize;
      this.selectedElement.posY = Math.round(newPosY / gridSize) * gridSize;

      this.drawSupport.drawExistingElements();

    } else if (!this.selectedElement && !this.selectedSplit) {
      this.drawSupport.translatePage(xPrev - x, yPrev - y);
      this.drawSupport.drawExistingElements();
    }
  }

  // Recursively normalize a subtree so that after a split movement or parent resize,
  // all nested children align to their parent's dimensions.
  private normalizeLayout(element: FurnitureElement): void {
    if (!element || !element.split) return;

    if (element.split instanceof HorizontalSplit) {
      const split = element.split;
      const parent = element;

      // Children widths follow parent width; align to left
      split.topElement.width = parent.width;
      split.bottomElement.width = parent.width;
      split.topElement.posX = 0;
      split.bottomElement.posX = 0;

      // Heights based on split position
      split.topElement.height = split.relativePositionY;
      split.topElement.posY = 0;

      split.bottomElement.posY = split.relativePositionY;
      split.bottomElement.height = parent.height - split.relativePositionY;

      // Recurse
      this.normalizeLayout(split.topElement);
      this.normalizeLayout(split.bottomElement);
    } else if (element.split instanceof VerticalSplit) {
      const split = element.split;
      const parent = element;

      // Children heights follow parent height; align to top
      split.leftElement.height = parent.height;
      split.rightElement.height = parent.height;
      split.leftElement.posY = 0;
      split.rightElement.posY = 0;

      // Widths based on split position
      split.leftElement.width = split.relativePositionX;
      split.leftElement.posX = 0;

      split.rightElement.posX = split.relativePositionX;
      split.rightElement.width = parent.width - split.relativePositionX;

      // Recurse
      this.normalizeLayout(split.leftElement);
      this.normalizeLayout(split.rightElement);
    }
  }

  public onEnd(x: number, y: number): void {
    console.log('[MOVE] onEnd called:', { x, y, isDragging: this.isDragging, selectedSplit: !!this.selectedSplit, selectedElement: !!this.selectedElement });

    if (this.isDragging) {
      if (this.selectedSplit) {
        // Finalize the split move by updating the model
        console.log('[MOVE] Finalizing split move');
        this.modelManager.refresh(this.selectedSplit.element);
      } else if (this.selectedElement) {
        // Finalize the element move by updating the model
        console.log('[MOVE] Finalizing element move');
        this.modelManager.refresh(this.selectedElement as FurnitureElement);
      }
    }

    this.isDragging = false;
    this.selectedElement = null;
    this.selectedSplit = null;
    console.log('[MOVE] Drag operation ended');
  }
}
