import { TestBed } from '@angular/core/testing';

import { FurnituremodelService } from './furnituremodel.service';

describe('FurnituremodelService', () => {
  let service: FurnituremodelService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FurnituremodelService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
