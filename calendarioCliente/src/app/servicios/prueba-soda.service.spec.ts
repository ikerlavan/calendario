import { TestBed } from '@angular/core/testing';

import { PruebaSodaService } from './prueba-soda.service';

describe('PruebaSodaService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PruebaSodaService = TestBed.get(PruebaSodaService);
    expect(service).toBeTruthy();
  });
});
