import { Reserva } from '../entidades/reserva';
import { CalendarEvent } from 'angular-calendar';

export interface AdapterEvent<S> {
  map(item: CalendarEvent<{ reserva: Reserva }>): S;
}
