import {
  Component,
  Input,
  ChangeDetectionStrategy,
  OnInit,
} from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  FormControl,
  Validators,
  AbstractControl,
  AsyncValidatorFn,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject, Observable, of } from 'rxjs';
import { CalendarEvent } from 'angular-calendar';
import { addMinutes } from 'date-fns';
import { ReservasValidator } from '../validation/validar-cabina';
import { ValidacionReservasService } from 'src/app/servicios/reservas/validacion-reservas.service';
import { Reserva, ReservaCalendar } from 'src/app/entidades/reserva';
import { EventosService } from 'src/app/servicios/eventos.service';
import { HttpClient } from '@angular/common/http';
import { Criterio } from 'src/app/entidades/criterio';
import { map, switchMap, debounceTime, take } from 'rxjs/operators';
import { ConfiguracionUtil } from 'src/app/util/configuracion.util';
import { Descripcion } from 'src/app/entidades/descripcion';

const colors: any = {
  cabina1: {
    primary: '#fd9883',
    secondary: '#fc2e02',
  },
  cabina2: {
    primary: '#fedd91',
    secondary: '#ffb200',
  },
  cabina3: {
    primary: '#96f5fe',
    secondary: '#01e5fc',
  },
  cabina4: {
    primary: '#f1b1ff',
    secondary: '#d100ff',
  },
};

@Component({
  selector: 'app-evento',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './evento.component.html',
  styleUrls: ['./evento.component.css'],
})
export class EventoComponent implements OnInit {
  @Input() formId: number;

  @Input() modalData: {
    action: string;
    cabina: string;
    event: CalendarEvent;
  };

  @Input() refresh: Subject<any>;

  @Input() datos: any;

  private events: CalendarEvent<{ reserva: Reserva }>[] = [];
  public reservas: CalendarEvent<{ reserva: Reserva }>[];

  public myForm: AbstractControl;

  private cabinaF = '';
  private startF = '';
  private endF = '';

  constructor(
    public activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private eventosService: EventosService,
    private http: HttpClient,
    private reservasValidator: ReservasValidator
  ) {}

  ngOnInit(): void {
    this.myForm = this.createForm();
    // this.myForm.setAsyncValidators(this.reservasValidator.validarCabina());
    // this.handleValueChanges();
  }

  private createForm() {
    const formulario = this.formBuilder.group({
      datosReserva: this.formBuilder.group({
        title: [
          this.modalData.event.meta.reserva.des.title,
          Validators.required,
        ],
        extension: [
          this.modalData.event.meta.reserva.des.extension || '',
          Validators.pattern('[0-9]{3}'),
        ],
        action: this.modalData.action || '',
        grupo: [
          this.modalData.event.meta.reserva.des.grupo || '',
          Validators.required,
        ],
        usuario: ['', [Validators.required]],
        cabina: [
          this.modalData.event.meta.reserva.des.cabina || '',
          [Validators.required],
          // ,
          // [this.validarCabina.bind(this)],
        ],
        primary: this.modalData.event.meta.reserva.des.primary || '',
        secondary: this.modalData.event.meta.reserva.des.secondary || '',
        _id: this.modalData.event.meta.reserva.id || '',
        _calendarId: this.modalData.event.meta.reserva.calendarId || '',
      }),
      camposReserva: this.formBuilder.group(
        {
          end: [
            this.modalData.action === 'create'
              ? addMinutes(
                  this.getDateWithActualTime(this.modalData.event.start),
                  30
                )
              : this.modalData.event.end,
            [
              Validators.required,
              // ,
              // this.validarFechaFin.bind(this.myForm.get('start').value),
            ],
            // ,
            // [this.validarCabina.bind(this)],
          ],
          start: [
            this.modalData.action === 'create'
              ? this.getDateWithActualTime(this.modalData.event.start)
              : this.modalData.event.start,
            [
              Validators.required,
              // , this.validarFechaInicio
            ],
            // ,
            // [this.validarCabina.bind(this)],
          ],
        },
        {
          validators: [
            this.validarFechas,
            this.events[0] ? { cabina: true, reservas: this.events } : null,
          ],
          asyncValidators: this.validateBusiness.bind(this),
        }
      ),
    });

    // this.setValueToForm(formulario);
    // formulario.setAsyncValidators(this.reservasValidator.validarCabina());
    return formulario;
  }

  private setValueToForm(formulario: AbstractControl) {
    for (const campo in formulario.value) {
      if (campo === 'start' || campo === 'end') {
        return this.setDateTimeByField(campo, formulario);
      } else {
        return formulario.get(campo).setValue(this.modalData.event[campo]);
      }
    }
  }

  private setDateTimeByField(campo: string, formulario: AbstractControl): void {
    if (this.modalData.action === 'create') {
      if (campo === 'start') {
        this.setStartDateTime(campo, formulario);
      } else {
        this.setEndDateTime(campo, formulario);
      }
    } else {
      formulario
        .get(campo)
        .setValue(this.modalData.event[campo], { emitEvent: true });
    }

    if (campo === 'start') {
      this.startF = this.modalData.event.meta.reserva.des[campo];
    } else {
      this.endF = this.modalData.event.meta.reserva.des[campo];
    }
  }

  private setStartDateTime(campo: string, formulario: AbstractControl): void {
    formulario
      .get(campo)
      .setValue(this.getDateWithActualTime(this.modalData.event[campo]));
  }

  private setEndDateTime(campo: string, formulario: AbstractControl): void {
    formulario
      .get(campo)
      .setValue(
        addMinutes(this.getDateWithActualTime(this.modalData.event[campo]), 30)
      );
  }

  private getDateWithActualTime(date: Date): Date {
    const h: Date = new Date();
    date.setHours(h.getHours());
    date.setMinutes(h.getMinutes());
    return date;
  }

  private validateBusiness(
    control: FormGroup
  ): Observable<ValidationErrors | null> {
    const criterio: Criterio = {
      fechaMin: this.myForm.get('start').value,
      fechaMax: this.myForm.get('end').value,
      maxResults: 100,
      calendarioId: this.myForm.get('_calendarId').value,
      q: 'cabin' + this.myForm.get('cabina').value,
    };
    const reserva = new ReservaCalendar().getReserva(
      this.myForm.value,
      null,
      null
    );
    let errors: ValidationErrors = null;
    return this.eventosService.listarCabinasOcupadas(criterio, reserva).pipe(
      map((data: any[]) => {
        this.events = data;
        return (errors = this.events[0]
          ? { cabina: true, reservas: this.events }
          : null);
      })
    );
  }

  // handleValueChanges() {
  //   this.myForm.get('cabina').valueChanges.subscribe((cabina) => {
  //     console.log(cabina);
  //     this.cabinaF = cabina;
  //     this.controlCampos();
  //   });

  //   this.myForm.get('start').valueChanges.subscribe((start) => {
  //     console.log(start);
  //     this.startF = start;
  //     this.controlCampos();
  //   });

  //   this.myForm.get('end').valueChanges.subscribe((end) => {
  //     console.log(end);
  //     this.endF = end;
  //     this.controlCampos();
  //   });
  // }
  // controlCampos() {
  //   console.log(this.startF);
  //   console.log(this.endF);
  //   console.log(this.cabinaF);

  //   if (
  //     this.cabinaF !== '' &&
  //     this.cabinaF !== '0' &&
  //     this.startF !== '' &&
  //     this.endF !== ''
  //   ) {
  //     console.log('setValidator');
  //     console.log(this.myForm.errors);
  //   }
  // }

  // private setCloneStartDateTime(campo :string, formulario:AbstractControl) :void {
  //   formulario.get(campo).setValue(addDays(this.modalData.event[campo], 1));
  // }

  // private setCloneEndDateTime(campo :string, formulario:AbstractControl) :void {
  //   formulario.get(campo).setValue(addDays(this.modalData.event[campo],1));
  // }

  closeModal() {
    this.activeModal.close({});
  }

  onSubmit() {
    if (!this.myForm.valid) {
      return false;
    }
    this.myForm.get('title').setValue(this.getTitle());
    this.activeModal.close(this.myForm.value);
  }

  // private validarUsuario(control: AbstractControl): any {
  //   const usuario = control.value;
  //   let error = null;
  //   if (usuario.includes('$')) {
  //     error = { ...error, dollar: 'needs a dollar symbol' };
  //   }
  //   return error;
  // }

  // private validarFechaInicio(control: AbstractControl): any {
  //   const fechaInicio = control.value;
  //   let error = null;
  //   if (fechaInicio !== '' && fechaInicio >= control.parent.get('end').value) {
  //     error = { ...error, fechaInicio: true };
  //   }
  //   return error;
  // }

  validarFechas(group: FormGroup): ValidationErrors | null {
    const fechaFin = group.get('end').value;
    const fechaInicio = group.get('start').value;
    let error = null;
    if (fechaFin !== '' && fechaInicio !== '' && fechaFin <= fechaInicio) {
      error = { ...error, fechaFin: true };
    }
    if (fechaFin === '' && fechaInicio === '') {
      error = { ...error, fechaVacia: true };
    }
    return error;
  }

  public addColor(e: any) {
    this.myForm
      .get('primary')
      .setValue(colors['cabina' + e.selectedOptions[0].innerText].primary);
    this.myForm
      .get('secondary')
      .setValue(colors['cabina' + e.selectedOptions[0].innerText].secondary);
  }

  public setEnd(e: any): Observable<any> {
    if (this.modalData.action !== 'clone') {
      return of(
        this.myForm.get('end').setValue(addMinutes(new Date(e.value), 30))
      );
    }
  }

  private getTitle(): string {
    return (
      'Cabina ' +
      this.myForm.get('cabina').value +
      ' - ' +
      this.myForm.get('usuario').value +
      ' (' +
      this.myForm.get('extension').value +
      ')'
    );
  }

  validarCabina(control: AbstractControl): Observable<ValidationErrors | null> {
    // return (control: AbstractControl): ValidationErrors | null => {
    console.log(this.myForm);
    console.log(control);

    if (control && this.myForm && this.myForm.get('cabina').value !== 0) {
      console.log(control);
      console.log('Entro en el if');
      const criterio: Criterio = {
        fechaMin: this.myForm.get('start').value,
        fechaMax: this.myForm.get('end').value,
        maxResults: 100,
        calendarioId: this.myForm.get('_calendarId').value,
        q: 'cabin' + this.myForm.get('cabina').value,
      };
      const descri = new Descripcion();
      descri.loadClassFromObject(this.myForm.value);
      const reserva: Reserva = {
        des: descri,
        start: { dateTime: this.myForm.value.start },
        end: { dateTime: this.myForm.value.end },
        id: this.myForm.value._id,
        calendarId: this.myForm.value.calendarId,
        summary: '',
        description: '',
      };

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

      // return control.valueChanges.pipe(
      //   debounceTime(500),
      //   take(1),
      //   switchMap((_) =>
      //     this.eventosService.listarCabinasOcupadas(criterio, reserva).pipe(
      //       map((data: any[]) => {
      //         if (data[0]) {
      //           return of({ cabina: true, reservas: data });
      //         } else {
      //           return of(null);
      //         }
      //       })
      //     )
      //   )
      // );
      // debugger;
      this.fillEvents(criterio, reserva);

      // if (this.events[0]) {
      //   return { cabina: true, reservas: this.events };
      // } else {
      //   return null;
      // }
      // control.valueChanges.subscribe(() =>
      //   this.http
      //     .post(
      //       ConfiguracionUtil.url +
      //         ConfiguracionUtil.eventos +
      //         '?criterio=' +
      //         JSON.stringify(criterio),
      //       reserva
      //     )
      //     .pipe(
      //       map((data: any[]) =>
      //         data[0] ? { cabina: true, reservas: data } : null
      //       )
      //     )
      // );

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
      return null;
    }
  }
  fillEvents(criterio: Criterio, reserva: Reserva): void {
    this.eventosService.listarCabinasOcupadas(criterio, reserva).subscribe(
      (data: any[]) => {
        this.events = data;
        return data[0] ? { cabina: true, reservas: data } : null;
        // if (this.events[0]) {
        //   this.myForm.setErrors({ cabina: true, reservas: this.events });
        // } else {
        //   return null;
        // }
      },
      (e) => console.error('error', e),
      () => console.log('CMPLITE')
    );
  }
  // }
}
