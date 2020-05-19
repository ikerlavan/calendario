import { Descripcion } from './descripcion';
import { CalendarEvent } from 'angular-calendar';

export interface Reserva {
  calendarId: string;
  kind?: string;
  etag?: string;
  id?: string;
  status?: string;
  htmlLink?: string;
  created?: string;
  updated?: string;
  summary: string;
  description: string;
  creator?: Creator;
  organizer?: Organizer;
  start: Fecha;
  end: Fecha;
  iCalUID?: string;
  sequence?: number;
  reminders?: Reminders;
  des: Descripcion;
}

export interface Creator {
  email: string;
}

export interface Organizer {
  email: string;
  displayName: string;
  self: boolean;
}

export interface Reminders {
  useDefault: boolean;
}

export interface Fecha {
  dateTime: string;
}

export class ReservaCalendar implements Reserva {
  calendarId: string;
  kind?: string;
  etag?: string;
  id?: string;
  status?: string;
  htmlLink?: string;
  created?: string;
  updated?: string;
  summary: string;
  description: string;
  creator?: Creator;
  organizer?: Organizer;
  start: Fecha;
  end: Fecha;
  iCalUID?: string;
  sequence?: number;
  reminders?: Reminders;
  des: Descripcion;

  constructor() {
    this.des = new Descripcion();
  }

  public getReserva(
    evento: any,
    events: CalendarEvent[],
    calendarId: string
  ): Reserva {
    const descri = new Descripcion();
    descri.loadClassFromObject(evento);

    if (undefined !== evento._id && evento._id !== '') {
      const reserva = events.filter(
        (e) => e.meta.reserva.id.trim() === evento._id.trim()
      );

      reserva[0].meta.reserva.des = descri;
      reserva[0].meta.reserva.start = { dateTime: evento.start };
      reserva[0].meta.reserva.end = { dateTime: evento.end };
      reserva[0].meta.reserva.summary = evento.title;
      reserva[0].meta.reserva.description = descri.toStringGoogleCalendar();
      reserva[0].meta.reserva.calendarId = calendarId;

      return reserva[0].meta.reserva;
    } else {
      return this.getNewReserva(
        evento,
        descri,
        { dateTime: evento.start },
        { dateTime: evento.end }
      );
    }
  }

  public getNewReserva(
    evento: CalendarEvent,
    descri: Descripcion,
    inicio: Fecha,
    fin: Fecha
  ): Reserva {
    return {
      summary: evento.title,
      description: descri.toStringGoogleCalendar(),
      start: inicio,
      end: fin,
      calendarId: this.calendarId,
      des: descri,
    };
  }
}
