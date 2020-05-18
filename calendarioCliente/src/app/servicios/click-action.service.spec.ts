import { TestBed } from '@angular/core/testing';

import { ClickActionService } from './click-action.service';

describe('ClickActionServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ClickActionService = TestBed.get(ClickActionService);
    expect(service).toBeTruthy();
  });
});
