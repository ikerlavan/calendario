import {
  AbstractControl,
  ValidationErrors,
  AsyncValidatorFn,
  ValidatorFn,
} from '@angular/forms';
import { Observable, of, timer } from 'rxjs';
import {
  debounceTime,
  take,
  switchMap,
  map,
  delay,
  mergeMap,
} from 'rxjs/operators';
import { EventosService } from 'src/app/servicios/eventos.service';
import { Criterio } from 'src/app/entidades/criterio';
import { ReservaCalendar, Reserva } from 'src/app/entidades/reserva';
import { CalendarEvent } from 'angular-calendar';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfiguracionUtil } from 'src/app/util/configuracion.util';

@Injectable({
  providedIn: 'root',
})
export class ReservasValidator {
  constructor(
    private eventosService: EventosService,
    private http: HttpClient
  ) {}

  validarCabina(): AsyncValidatorFn {
    return (
      control: AbstractControl
    ):
      | Promise<ValidationErrors | null>
      | Observable<ValidationErrors | null> => {
      const events: CalendarEvent<{ reserva: Reserva }>[] = [];
      console.log(control);
      if (
        control &&
        control.get('cabina').value !== '' &&
        control.get('cabina').value !== 0
      ) {
        console.log(control);
        console.log('Entro en el if');
        const criterio: Criterio = {
          fechaMin: control.get('start').value,
          fechaMax: control.get('end').value,
          maxResults: 100,
          calendarioId: control.get('_calendarId').value,
          q: 'cabin' + control.get('cabina').value,
        };
        const reserva = new ReservaCalendar().getReserva(
          control.value,
          null,
          null
        );

        console.log('Antes de llamar');

        // this.http
        //   .get('https://jsonplaceholder.typicode.com/users', {
        //     params: { username: 'Bret' },
        //   })
        //   .toPromise()
        //   .then((user: any[]) => (user[0] ? { exists: { user } } : null));

        // this.http
        //   .get('https://jsonplaceholder.typicode.com/users', {
        //     params: { username: 'Bret' },
        //   })
        //   .pipe(
        //     map((user: any[]) =>
        //       user[0] ? { cabina: true, reservas: user } : null
        //     )
        //   );
        // return new Promise((resolve, reject) => {
        control.valueChanges.pipe(map(() => console.log('Hola')));

        this.eventosService.listarCabinasOcupadas(criterio, reserva).pipe(
          map((data: any[]) => {
            if (data[0]) {
              return { cabina: true, reservas: data };
            } else {
              return null;
            }
          })
        );

        control.valueChanges.subscribe(() =>
          this.http
            .post(
              ConfiguracionUtil.url +
                ConfiguracionUtil.eventos +
                '?criterio=' +
                JSON.stringify(criterio),
              reserva
            )
            .pipe(
              map((data: any[]) =>
                data[0] ? { cabina: true, reservas: data } : null
              )
            )
        );

        // this.http
        //   .post(
        //     ConfiguracionUtil.url +
        //       ConfiguracionUtil.eventos +
        //       '?criterio=' +
        //       JSON.stringify(criterio),
        //     reserva
        //   )
        //   .pipe(
        //     map((data: any[]) =>
        //       return of(data[0] ? { cabina: true, reservas: data } : null)
        //     )
        //   );

        // this.http
        //   .post(
        //     ConfiguracionUtil.url +
        //       ConfiguracionUtil.eventos +
        //       '?criterio=' +
        //       JSON.stringify(criterio),
        //     reserva
        //   )
        //   .toPromise()
        //   .then((cabinas) => {
        //     if (cabinas[0]) {
        //       return { cabina: true, reservas: cabinas };
        //     } else {
        //       return null;
        //     }
        //   });

        // });

        // return (
        //   this.http
        //     .post(
        //       ConfiguracionUtil.url +
        //         ConfiguracionUtil.eventos +
        //         '?criterio=' +
        //         JSON.stringify(criterio),
        //       reserva
        //     )
        //     // .pipe(
        //     //   map((cabinas: any[]) => {
        //     //     console.log(cabinas);
        //     //     return cabinas.length > 0
        //     //       ? { cabina: true, reservas: cabinas }
        //     //       : null;
        //     //   })
        //     // );
        //     .toPromise()
        //     .then((cabinas: any[]) =>
        //       cabinas.length > 0 ? { cabina: true, reservas: cabinas } : null
        //     )
        // );

        // return control.valueChanges.pipe(
        //   debounceTime(50),
        //   take(1),
        //   switchMap((_) =>
        //     this.http
        //       .post(
        //         ConfiguracionUtil.url +
        //           ConfiguracionUtil.eventos +
        //           '?criterio=' +
        //           JSON.stringify(criterio),
        //         reserva
        //       )
        //       .pipe(
        //         map((cabinas: any[]) =>
        //           cabinas.length > 0
        //             ? { cabina: true, reservas: cabinas }
        //             : null
        //         )
        //       )
        //   )
        // );

        // return eventosService
        //   .listar(criterio)
        //   .pipe(
        //     map((user: any[]) => (user[0] ? { exists: { cabina: true } } : null))
        //   );

        // return eventosService.listar(criterio).pipe(
        //   map((cabinas) => {
        //     cabinas.length > 0 ? { cabina: true, reservas: cabinas } : null;
        //   })
        // );

        // if (events.length > 0) {
        //   return of({ cabina: true, reservas: events }).pipe(delay(500));
        // } else {
        //   return of(null).pipe(delay(500));
        // }

        // return eventosService.listarCabinasOcupadas(criterio, reserva).pipe(
        //   map((cabinas: CalendarEvent<{ reserva: Reserva }>[]) => {
        //     console.log('Cabinas');
        //     if (cabinas.length > 0) {
        //       return { cabina: true, reservas: cabinas };
        //     } else {
        //       return null;
        //     }
        //   })
        // );

        // return eventosService.listarCabinasOcupadas(criterio, reserva).pipe(switchMap((_) =>);
        // return eventosService.listarCabinasOcupadas(criterio, reserva).pipe(
        //   map((cabinas) => {
        //     if (cabinas.length > 0) {
        //       return { cabina: true, reservas: cabinas };
        //     } else {
        //       return null;
        //     }
        //   })
        // );

        // if (events.length > 0) {
        //   return of({ cabina: true, reservas: events });
        // } else {
        //   return of(null);
        // }
        // return eventosService.listarCabinasOcupadas(criterio, reserva).pipe(
        //   map((cabinas) => {
        //     console.log(cabinas);
        //     if (cabinas.length > 0) {
        //       return { cabina: true, reservas: cabinas };
        //     } else {
        //       return null;
        //     }
        //   })
        // );

        // return control.valueChanges.pipe(
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
      } else {
        return of(null);
      }
    };
  }
}
