import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, timer } from 'rxjs';
import { CalendarEvent } from 'angular-calendar';
import { ConfiguracionUtil } from '../util/configuracion.util';
import { Criterio } from '../entidades/criterio';
import { Reserva } from '../entidades/reserva';
import { EventoAdapter } from '../mapper/mapping/evento.model';
import { map, switchMap, delay, take, debounceTime } from 'rxjs/operators';
import { EventoGoogleAdapter } from '../mapper/mapping/evento-google-calendar.model';

@Injectable({
  providedIn: 'root',
})
export class EventosService {
  constructor(
    private httpClient: HttpClient,
    private inputAdapter: EventoAdapter,
    private outputAdapter: EventoGoogleAdapter
  ) {}

  public listar(
    criterio: Criterio
  ): Observable<CalendarEvent<{ reserva: Reserva }>[]> {
    return this.httpClient
      .get(
        ConfiguracionUtil.url +
          ConfiguracionUtil.eventos +
          '?criterio=' +
          JSON.stringify(criterio)
      )
      .pipe(
        map((data: any[]) => data.map((item) => this.inputAdapter.map(item)))
      );
  }

  public guardar(
    reserva: Reserva,
    calendarId: string
  ): Observable<CalendarEvent<{ reserva: Reserva }>> {
    console.log('guardar');

    if (!reserva.id) {
      console.log('Hay que insertar');
      return this.insertar(this.outputAdapter.map(reserva), calendarId);
    }
    console.log('Hay que modificar');
    return this.modificar(reserva, calendarId);
  }

  public insertar(
    reserva: Reserva,
    calendarId: string
  ): Observable<CalendarEvent<{ reserva: Reserva }>> {
    return this.httpClient
      .post(
        ConfiguracionUtil.url + ConfiguracionUtil.eventos + '/' + calendarId,
        reserva
      )
      .pipe(map((item: any) => this.inputAdapter.map(item)));
  }

  public modificar(
    reserva: Reserva,
    calendarId: string
  ): Observable<CalendarEvent<{ reserva: Reserva }>> {
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    console.log('Voy a modificar');
    return this.httpClient
      .put(
        ConfiguracionUtil.url +
          ConfiguracionUtil.eventos +
          '/' +
          calendarId +
          '/' +
          reserva.id,
        reserva,
        { headers: httpHeaders }
      )
      .pipe(map((item: any) => this.inputAdapter.map(item)));
  }

  public borrar(reserva: Reserva, calendarId: string): Observable<any> {
    console.log('Voy a borrar');
    return this.httpClient.delete(
      ConfiguracionUtil.url +
        ConfiguracionUtil.eventos +
        '/' +
        calendarId +
        '/' +
        reserva.id
    );
  }

  public listarCabinasOcupadas(
    criterio: Criterio,
    reserva: Reserva
  ): Observable<CalendarEvent<{ reserva: Reserva }>[]> {
    return this.httpClient
      .post(
        ConfiguracionUtil.url +
          ConfiguracionUtil.eventos +
          '?criterio=' +
          JSON.stringify(criterio),
        reserva
      )
      .pipe(
        debounceTime(500),
        switchMap(() =>
          map((data: any[]) => data.map((item) => this.inputAdapter.map(item)))
        )
      );

    // .pipe(
    //   debounceTime(500),
    //   take(1),
    //   switchMap((_) =>
    //     eventosService.listarCabinasOcupadas(criterio, reserva).pipe(
    //       map((cabinas) => {
    //         console.log(cabinas);
    //         if (cabinas.length > 0) {
    //           return { cabina: true, reservas: cabinas };
    //         } else {
    //           return null;
    //         }
    //       })
    //     )
    //   )
    // );

    // return cabinasOcupadas;
  }
}
