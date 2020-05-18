import { Component, OnInit, Input } from '@angular/core';
import { CalendarEvent } from 'angular-calendar';
import { Reserva } from 'src/app/entidades/reserva';

@Component({
  selector: 'app-cabinas-ocupadas',
  templateUrl: './cabinas-ocupadas.component.html',
  styleUrls: ['./cabinas-ocupadas.component.css'],
})
export class CabinasOcupadasComponent implements OnInit {
  @Input() reservas: CalendarEvent<{ reserva: Reserva }>[] = [];

  constructor() {}

  ngOnInit() {
    // this.reservas.;
  }
}
