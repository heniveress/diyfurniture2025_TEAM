import { TestBed } from '@angular/core/testing';

import { ModelchangeService } from './modelchange.service';

describe('ModelchangeService', () => {
  let service: ModelchangeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ModelchangeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
