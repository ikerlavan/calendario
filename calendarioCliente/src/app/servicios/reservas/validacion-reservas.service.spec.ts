import { TestBed } from '@angular/core/testing';

import { ValidacionReservasService } from './validacion-reservas.service';

describe('ValidacionReservasService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ValidacionReservasService = TestBed.get(ValidacionReservasService);
    expect(service).toBeTruthy();
  });
});
