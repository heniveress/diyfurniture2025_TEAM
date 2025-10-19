import { TestBed } from '@angular/core/testing';

import { EventHandlerManagerService } from './event-handler-manager.service';

describe('EventHandlerManagerService', () => {
  let service: EventHandlerManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EventHandlerManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
