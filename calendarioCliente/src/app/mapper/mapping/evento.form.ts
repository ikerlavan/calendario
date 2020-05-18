import { Injectable } from '@angular/core';
import { Reserva, ReservaCalendar } from 'src/app/entidades/reserva';
import { CalendarEvent } from 'angular-calendar';
import { AdapterEvent } from '../adapterEvent';

@Injectable({
  providedIn: 'root',
})
export class EventoToFormAdapter implements AdapterEvent<any> {
  constructor() {}

  map(event: CalendarEvent<{ reserva: Reserva }>): any {
    const start = new Date(event.meta.reserva.start.dateTime);
    const end = new Date(event.meta.reserva.end.dateTime);

    return {
      title: event.meta.reserva.summary,
      start,
      end,
      _calendarId: event.meta.reserva.calendarId,
      cabina: event.meta.reserva.des.cabina,
      _id: event.meta.reserva.id,
    };
  }
}
