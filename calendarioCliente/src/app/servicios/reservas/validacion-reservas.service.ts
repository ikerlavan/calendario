import { Injectable } from '@angular/core';
import { Criterio } from 'src/app/entidades/criterio';
import { CalendarEvent } from 'angular-calendar';
import { Reserva } from 'src/app/entidades/reserva';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { EventosService } from '../eventos.service';

@Injectable({
  providedIn: 'root',
})
export class ValidacionReservasService {
  constructor(private eventosService: EventosService) {}

  public getReservasOcupadas(
    cita: any
  ): Observable<CalendarEvent<{ reserva: Reserva }>[]> {
    console.log(typeof cita.cabina);
    if (cita.cabina > 0 && cita.cabina !== '') {
      const criterio: Criterio = {
        fechaMin: cita.start,
        fechaMax: cita.end,
        maxResults: 100,
        calendarioId: cita._calendarId,
        q: 'cabin' + cita.cabina,
      };

      return this.eventosService.listar(criterio).pipe(
        map((reservas) => {
          return reservas.filter((iEvent) => {
            const start = cita.start;
            const end = cita.end;
            let cabina: number;
            if (cita.cabina) {
              cabina = Number(cita.cabina);
            } else if (undefined !== cita.meta) {
              cabina = Number(cita.meta.reserva.des.cabina);
            }

            if (iEvent.meta.reserva.id === cita._id) {
              console.log('iEvent.meta.reserva.id == cita.get("_id").value');
              console.log(iEvent.meta.reserva.id === cita._id);
              return false;
            }

            if (
              start === end &&
              cabina === iEvent.meta.reserva.des.cabina &&
              iEvent.meta.reserva.id !== cita._id
            ) {
              console.log('Misma fecha y hora y cabina');
              return true;
            }

            if (start === iEvent.start && end === iEvent.end) {
              console.log('start == iEvent.start && end == iEvent.end');
              return true;
            }
            console.log('Condición');
            console.log(
              ((start > iEvent.start || start < iEvent.start) &&
                end <= iEvent.end) ||
                end >= iEvent.start
            );
            console.log(
              (start > iEvent.start || start < iEvent.start) &&
                (end <= iEvent.end || end >= iEvent.start) &&
                null != iEvent.meta.reserva.des.cabina &&
                cabina === iEvent.meta.reserva.des.cabina
            );

            return (
              (start > iEvent.start || start < iEvent.start) &&
              (end <= iEvent.end || end >= iEvent.start) &&
              null != iEvent.meta.reserva.des.cabina &&
              cabina === iEvent.meta.reserva.des.cabina
            );
          });
        })
      );
      // },
      // (error) => {
      //   console.log(error);
      // }
    }
  }
}
