import { ActionsEvents } from './actions-events';
import { TestBed } from '@angular/core/testing';

describe('ActionsEvents', () => {

  beforeEach(() => TestBed.configureTestingModule({}));

  it('should create an instance', () => {
    const service: ActionsEvents = TestBed.get(ActionsEvents);
    expect(service).toBeTruthy();
  });
});


