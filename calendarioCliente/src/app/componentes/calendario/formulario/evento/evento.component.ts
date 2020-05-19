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
    private reservasValidator: ReservasValidator
  ) {}

  ngOnInit(): void {
    this.myForm = this.createForm();
  }

  private createForm() {
    const formulario = this.formBuilder.group({

        title: [
          this.modalData.event.meta.reserva.des.title
        ],
        action: this.modalData.action || '',
        primary: this.modalData.event.meta.reserva.des.primary || '',
        secondary: this.modalData.event.meta.reserva.des.secondary || '',
        _id: this.modalData.event.meta.reserva.id || '',
        _calendarId: this.modalData.event.meta.reserva.calendarId || '',

        extension: [
          this.modalData.event.meta.reserva.des.extension || '',
          Validators.pattern('[0-9]{3}'),
        ],

        usuario: [this.modalData.event.meta.reserva.des.usuario || '', [Validators.required]],

        grupo: [
          this.modalData.event.meta.reserva.des.grupo || '',
          Validators.required,
        ],

        cabina: [
          this.modalData.event.meta.reserva.des.cabina || '',
          [Validators.required],
        ],

        end: [
          this.modalData.action === 'create'
            ? addMinutes(
                this.getDateWithActualTime(this.modalData.event.start),
                30
              )
            : this.modalData.event.end,
          [Validators.required]
        ],

        start: [
          this.modalData.action === 'create'
            ? this.getDateWithActualTime(this.modalData.event.start)
            : this.modalData.event.start,
          [Validators.required]
        ],
        }/*,
        {
          validators: [
            this.validarFechas,
            this.events[0] ? { cabina: true, reservas: this.events } : null,
          ],
          asyncValidators: this.validateBusiness.bind(this),
        }*/

    );

    return formulario;
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

  private validarCabina(control: AbstractControl): Observable<ValidationErrors | null> {
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

      this.fillEvents(criterio, reserva);

    } else {
      return null;
    }
  }
  fillEvents(criterio: Criterio, reserva: Reserva): void {
    this.eventosService.listarCabinasOcupadas(criterio, reserva).subscribe(
      (data: any[]) => {
        this.events = data;
        return data[0] ? { cabina: true, reservas: data } : null;
      },
      (e) => console.error('error', e),
      () => console.log('COMPLETE')
    );
  }

}
