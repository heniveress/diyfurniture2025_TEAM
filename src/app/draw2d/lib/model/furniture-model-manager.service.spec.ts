import { TestBed } from '@angular/core/testing';

import { FurnitureModelManagerService } from './furniture-model-manager.service';

describe('FurnitureModelManagerService', () => {
  let service: FurnitureModelManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FurnitureModelManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
