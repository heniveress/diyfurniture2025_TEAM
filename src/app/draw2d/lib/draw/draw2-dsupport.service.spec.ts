import { TestBed } from '@angular/core/testing';

import { Draw2DSupportService } from './draw2-dsupport.service';

describe('Draw2DSupportService', () => {
  let service: Draw2DSupportService;

  beforeEach(() => {
    TestBed.configureTestingModule({providers: [Draw2DSupportService],});
    service = TestBed.inject(Draw2DSupportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
