import { Injectable } from '@angular/core';
import { Adapter } from '../adapter';
import { Reserva } from 'src/app/entidades/reserva';

@Injectable({
  providedIn: 'root',
})
export class EventoGoogleAdapter implements Adapter<Reserva> {
  map(reserva: Reserva): Reserva {
    delete reserva.htmlLink;
    delete reserva.organizer;
    delete reserva.iCalUID;
    delete reserva.creator;
    delete reserva.des;
    delete reserva.created;
    delete reserva.reminders;
    delete reserva.kind;
    delete reserva.etag;
    delete reserva.status;
    delete reserva.updated;
    delete reserva.sequence;
    delete reserva.calendarId;
    return reserva;
  }
}
