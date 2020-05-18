import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CabinasOcupadasComponent } from './cabinas-ocupadas.component';

describe('CabinasOcupadasComponent', () => {
  let component: CabinasOcupadasComponent;
  let fixture: ComponentFixture<CabinasOcupadasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CabinasOcupadasComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CabinasOcupadasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
