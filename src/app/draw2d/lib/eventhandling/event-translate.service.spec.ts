import { TestBed } from '@angular/core/testing';

import { EventTranslateService } from './event-translate.service';

describe('EventTranslateService', () => {
  let service: EventTranslateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EventTranslateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
