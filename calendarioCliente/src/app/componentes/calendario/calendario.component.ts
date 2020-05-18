import 'flatpickr/dist/flatpickr.css';
import {
  Component,
  ChangeDetectionStrategy,
  ViewChild,
  TemplateRef,
  Input,
  ViewEncapsulation,
  ChangeDetectorRef,
} from '@angular/core';
import {
  startOfDay,
  endOfDay,
  subDays,
  addDays,
  endOfMonth,
  isSameDay,
  isSameMonth,
  addHours,
  differenceInHours,
  getHours,
  isSameMinute,
} from 'date-fns';
import { Subject, Subscription } from 'rxjs';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import {
  CalendarEvent,
  CalendarEventTitleFormatter,
  CalendarEventAction,
  CalendarEventTimesChangedEvent,
  CalendarView,
  CalendarMonthViewDay,
  DAYS_OF_WEEK,
} from 'angular-calendar';

import { EventosService } from 'src/app/servicios/eventos.service';
import { Criterio } from 'src/app/entidades/criterio';
import { Reserva, Fecha, ReservaCalendar } from 'src/app/entidades/reserva';
import { CustomEventTitleFormatter } from './custom-event-title-formatter.provider';
import { Observable } from 'rxjs';
import { EventoComponent } from './formulario/evento/evento.component';
import { ClickActionService } from 'src/app/servicios/click-action.service';
import { ValidacionReservasService } from 'src/app/servicios/reservas/validacion-reservas.service';
import { EventoToFormAdapter } from 'src/app/mapper/mapping/evento.form';

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
    secondary: '#053DC2',
  },
  cabina4: {
    primary: '#f1b1ff',
    secondary: '#cc01b6a8',
  },
};

@Component({
  selector: 'app-calendario',
  // changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './calendario.component.html',
  styleUrls: ['./calendario.component.css'],
  providers: [
    {
      provide: CalendarEventTitleFormatter,
      useClass: CustomEventTitleFormatter,
    },
  ],
  encapsulation: ViewEncapsulation.None,
})
export class CalendarioComponent {
  public modalData: {
    action: string;
    cabina: string;
    event: CalendarEvent<{ reserva: Reserva }>;
  };

  // modal: NgbModalRef | null;

  public view: CalendarView = CalendarView.Month;

  public CalendarView = CalendarView;

  public viewDate: Date = new Date();

  public weekStartsOn: number = DAYS_OF_WEEK.MONDAY;

  public weekendDays: number[] = [DAYS_OF_WEEK.SATURDAY, DAYS_OF_WEEK.SUNDAY];

  public calendarId: string;
  public selectedRoom: string;

  public datos: any[] = [];

  // public actions: CalendarEventAction[] = [
  //   {
  //     label: '<i class='fa fa-fw fa-pencil'></i>'
  //     , onClick: ({ event }: { event: CalendarEvent<{ reserva: Reserva }> }): void => {
  //       this.handleEvent('edit', event);
  //     }
  //     , a11yLabel: 'Edit',
  //   },
  //   {
  //     label: '<i class='fa fa-fw fa-times'></i>'
  //     , onClick: ({ event }: { event: CalendarEvent<{ reserva: Reserva }> }): void => {
  //       this.handleEvent('delete', event);
  //     }
  //     , a11yLabel: 'Delete',
  //   }
  // ];

  public Rooms: any = [
    {
      text: 'MICROBIOLOGIA',
      value: 'ebndia3jm60cb3v0lhhjf6gkdo',
    },
    {
      text: 'CULTIVOS',
      value: '3ogj615nk37q3rjea1gmedbts0',
    },
  ];

  public refresh: Subject<any> = new Subject();

  // events$: Observable<Array<CalendarEvent<{ reserva: Reserva }>>>;
  public events: Array<CalendarEvent<{ reserva: Reserva }>> = [];

  public showMarker = true;

  public dayStartHour = 0;
  public dayEndHour = 23;

  public activeDayIsOpen = false;

  constructor(
    private modalService: NgbModal,
    private eventosService: EventosService,
    private changeDetector: ChangeDetectorRef,
    private clickActionService: ClickActionService,
    private validacionReservasService: ValidacionReservasService,
    private eventoToFormAdapter: EventoToFormAdapter
  ) {
    this.datos[this.Rooms[0].text] = {
      key: 'MICROBIOLOGIA',
      grupos: [
        'BAT',
        'BEA',
        'BFBL',
        'CARBOHIDRATOS',
        'FFPV',
        'MICROBIOS',
        'NUTRIC MOLEC',
        'SIMGI',
        'UAM',
      ],
      cabinas: ['1', '2', '3', '4'],
    };
    this.datos[this.Rooms[1].text] = {
      key: 'CULTIVOS',
      grupos: [
        'ALERGIAS ALIM',
        'BAT',
        'BEA',
        'BFBL',
        'BIOCIENCIA',
        'CARBOHIDRATOS',
        'FFPV',
        'FOODOMICS',
        'MICROBIOS',
        'NUTRIC MOLEC',
        'PROTEINA ALIM',
        'UAM',
      ],
      cabinas: ['1', '2', '3', '4'],
    };

    this.clickActionService
      .getAction()
      .subscribe(({ action, event }) => this.handleEvent(action, event));
  }

  onInit() {}

  public buscarEventos(): void {
    const criterio: Criterio = {
      fechaMin: new Date(
        this.viewDate.getFullYear(),
        this.viewDate.getMonth(),
        0
      ).toString(),
      fechaMax: new Date(
        this.viewDate.getFullYear(),
        this.viewDate.getMonth() + 2,
        1
      ).toString(),
      maxResults: 1000,
      calendarioId: this.calendarId,
    };

    this.eventosService.listar(criterio).subscribe(
      (reservas) => {
        this.events = reservas;

        reservas.sort((a, b) => {
          const af = a.start;
          const bf = b.start;
          const as = a.meta.reserva.des.cabina;
          const bs = b.meta.reserva.des.cabina;

          if (as === bs) {
            return af > bf ? -1 : af < bf ? 1 : 0;
          } else {
            return as < bs ? -1 : 1;
          }
        });
      },
      (error) => console.log(error)
    );
    this.refresh.next();
  }

  dayClicked({
    date,
    events,
  }: {
    date: Date;
    events: CalendarEvent<{ reserva: Reserva }>[];
  }): void {
    if (isSameMonth(date, this.viewDate)) {
      if (
        (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
        events.length === 0
      ) {
        this.activeDayIsOpen = false;
      } else {
        this.activeDayIsOpen = true;
        this.viewDate = date;
      }
      // this.handleEvent('create', this.getNewEvent(date, null));
    }
  }

  eventMomentClicked(date: any): void {
    this.handleEvent('create', this.getNewEvent(date, null));
  }

  eventClicked(event: CalendarEvent<{ reserva: Reserva }>): void {
    this.viewDate = event.start;
    this.activeDayIsOpen = true;
    this.handleEvent('edit', event);
  }

  eventTimesChanged({
    event,
    newStart,
    newEnd,
  }: CalendarEventTimesChangedEvent): void {
    const evento: CalendarEvent<{ reserva: Reserva }>[] = this.events.filter(
      (iEvent) => {
        if (iEvent === event) {
          return iEvent;
        }
      }
    );
    (evento[0].start = newStart), (evento[0].end = newEnd);
    this.events = this.events.map((iEvent) => {
      if (iEvent === event) {
        return {
          ...event,
          start: newStart,
          end: newEnd,
        };
      }
      return iEvent;
    });
    this.handleEvent('Dropped or resized', evento[0]);
  }

  nuevoEvent(date: Date): void {
    this.handleEvent('create', this.getNewEvent(date, null));
    this.refresh.next();
  }

  addEvent(event: CalendarEvent, reserva: Reserva): void {
    if (null == event) {
      this.events = [...this.events, this.getNewEvent(null, reserva)];
    } else {
      this.events = this.events.map((e) => {
        if (e.meta.reserva.id === event.meta.reserva.id) {
          return event;
        }
        return e;
      });
    }
  }

  private getNewEvent(
    date: Date,
    reserva: Reserva
  ): CalendarEvent<{ reserva: Reserva }> {
    if (null == date) {
      this.getNewEventActualDate(reserva);
    }
    return this.getNewEventWithSelectedDate(date, reserva);
  }

  private getNewEventActualDate(
    reserva: Reserva
  ): CalendarEvent<{ reserva: Reserva }> {
    return {
      title: 'New event',
      start: startOfDay(new Date()),
      end: endOfDay(new Date()),
      color: colors.cabina1,
      draggable: true,
      resizable: {
        beforeStart: true,
        afterEnd: true,
      },
      meta: { reserva },
    };
  }

  private getNewEventWithSelectedDate(
    date: Date,
    reserva: Reserva
  ): CalendarEvent<{ reserva: Reserva }> {
    console.log(date);
    return {
      title: 'New event',
      start: date,
      end: date,
      color: colors.red,
      draggable: true,
      resizable: {
        beforeStart: true,
        afterEnd: true,
      },
      meta: { reserva: reserva || new ReservaCalendar() },
    };
  }

  // public deleteEvent(eventToDelete: CalendarEvent<{ reserva: Reserva }>) {
  //   this.events = this.events.filter(event => event !== eventToDelete);
  // }

  public setView(view: CalendarView) {
    this.view = view;
  }

  public closeOpenMonthViewDay() {
    this.activeDayIsOpen = false;
    this.buscarEventos();
  }

  public changeRoom(e: any) {
    this.selectedRoom = e.selectedOptions[0].innerText;
    this.calendarId = e.value;
    this.buscarEventos();
  }

  public handleEvent(
    action: string,
    event: CalendarEvent<{ reserva: Reserva }>
  ): void {
    event.meta.reserva.calendarId = this.calendarId;

    if (action === 'delete') {
      this.deleteEvent(event.meta.reserva);
    }

    if (action === 'Dropped or resized') {
      event.meta.reserva.start = { dateTime: event.start.toLocaleDateString() };
      event.meta.reserva.end = { dateTime: event.end.toLocaleDateString() };

      // const eventosFiltrados: CalendarEvent[] = this.validacionReservasService.getReservasOcupadas(
      //   this.eventoToFormAdapter.map(event)
      // );
      // if (eventosFiltrados.length <= 0) {
      //   this.saveEvent(event.meta.reserva);
      // }
    }

    if (
      action === 'create' ||
      action === 'clone' ||
      (action === 'edit' &&
        event.actions.length > 1 &&
        undefined !== this.selectedRoom)
    ) {
      if (action === 'clone') {
        this.cloneAction(action, event);
      } else {
        this.modalWindow(action, event);
      }
    }
  }

  private cloneAction(
    action: string,
    event: CalendarEvent<{ reserva: Reserva }>
  ) {
    const res: Reserva = {
      start: event.meta.reserva.start,
      end: event.meta.reserva.end,
      summary: event.meta.reserva.summary,
      calendarId: event.meta.reserva.calendarId,
      description: event.meta.reserva.description,
      id: null,
      des: event.meta.reserva.des,
    };
    const cloneEvent: CalendarEvent<{ reserva: Reserva }> = {
      start: addDays(event.start, 1),
      end: addDays(event.end, 1),
      color: event.color,
      title: event.title,
      meta: {
        reserva: res,
      },
    };
    this.viewDate = cloneEvent.start;
    this.modalWindow(action, cloneEvent);
  }

  private modalWindow(
    action: string,
    event: CalendarEvent<{ reserva: Reserva }>
  ) {
    const cabina: string = this.selectedRoom;
    this.modalData = { event, cabina, action };

    const modal = this.modalService.open(EventoComponent);

    modal.componentInstance.formId = 101;
    modal.componentInstance.modalData = this.modalData;
    modal.componentInstance.refresh = this.refresh;
    modal.componentInstance.datos = this.datos[this.selectedRoom];
    modal.componentInstance.eventos = this.events.filter((evento) =>
      isSameDay(event.start, evento.start)
    );

    if (modal) {
      modal.result
        .then((result) => {
          console.log('result');
          console.log(result);

          console.log('modalData.reserva');
          console.log(this.modalData.event);

          if (undefined !== result) {
            const reserva = new ReservaCalendar().getReserva(
              result,
              this.events,
              this.selectedRoom
            );

            this.modalData.event = {
              meta: { reserva },
              start: result.start,
              end: result.end,
              color: {
                primary: result.primary,
                secondary: result.secondary,
              },
              title: result.title,
              allDay: false,
            };
            this.saveEvent(reserva);
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }

  private saveEvent(reserva: Reserva) {
    this.eventosService.guardar(reserva, this.calendarId).subscribe(
      (event) => {
        if (event != null) {
          console.log(event);
          this.events = this.events.filter(
            (iEvent) => iEvent.meta.reserva.id !== event.meta.reserva.id
          );
          this.events.push(event);
          this.refresh.next();
          this.buscarEventos();
        }
      },
      (error: any) => console.log(error)
    );
  }

  private deleteEvent(reserva: Reserva) {
    const id: string = reserva.id;
    this.eventosService.borrar(reserva, this.calendarId).subscribe(
      (event) => {
        this.events = this.events.filter(
          (iEvent) => iEvent.meta.reserva.id !== id
        );
        this.refresh.next();
        this.buscarEventos();
        console.log(this.events);
      },
      (error: any) => console.log(error)
    );
  }
}
