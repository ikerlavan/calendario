import { Injectable } from '@angular/core';
import { Adapter } from '../adapter';
import { Reserva, ReservaCalendar } from 'src/app/entidades/reserva';
import { CalendarEvent } from 'angular-calendar';
import { Descripcion } from 'src/app/entidades/descripcion';
import { ActionsEvents } from 'src/app/util/actions-events';

@Injectable({
  providedIn: 'root',
})
export class EventoAdapter
  implements Adapter<CalendarEvent<{ reserva: Reserva }>> {
  constructor(private actionsEvents: ActionsEvents) {}

  map(item: any): CalendarEvent<{ reserva: Reserva }> {
    let reserva: Reserva = null;
    if (item.data) {
      reserva = item.data;
    } else {
      reserva = item;
    }

    reserva.des = new Descripcion();
    reserva.des.loadClassFromString(reserva.description);

    const start = new Date(reserva.start.dateTime);
    const end = new Date(reserva.end.dateTime);

    return {
      title: reserva.summary,
      start,
      end,
      color: {
        primary: reserva.des.primary,
        secondary: reserva.des.secondary,
      },
      meta: { reserva },
      actions: this.actionsEvents.getActionsToEvent(start, end),
      draggable: this.isDraggable(start, end),
    };
  }

  private isDraggable(start: Date, end: Date): boolean {
    const date = new Date();
    if (start < date && end < date) {
      return false;
    }

    return true;
  }
}
