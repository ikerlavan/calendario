import { ClickActionService } from '../servicios/click-action.service';
import { CalendarEventAction, CalendarEvent } from 'angular-calendar';
import { Reserva } from '../entidades/reserva';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ActionsEvents {
  public actions: CalendarEventAction[] = [];

  constructor(private clickActionService: ClickActionService) {
    this.actions = [
      {
        label: '<i class="ml-1 fa fa-pencil"></i>',
        onClick: ({
          event,
        }: {
          event: CalendarEvent<{ reserva: Reserva }>;
        }): void => {
          clickActionService.sendAction('edit', event);
        },
        a11yLabel: 'Edit',
      },
      {
        label: '<i class="ml-1 fa fa-trash-o"></i>',
        onClick: ({
          event,
        }: {
          event: CalendarEvent<{ reserva: Reserva }>;
        }): void => {
          clickActionService.sendAction('delete', event);
        },
        a11yLabel: 'Delete',
      },
      {
        label: '<i class="ml-1 fa fa-files-o"></i>',
        onClick: ({
          event,
        }: {
          event: CalendarEvent<{ reserva: Reserva }>;
        }): void => {
          clickActionService.sendAction('clone', event);
        },
        a11yLabel: 'Clone',
      },
    ];
  }

  public getActionsToEvent(start: Date, end: Date): CalendarEventAction[] {
    const now = this.getDateWithoutTime(new Date());
    const actionsInEvent: CalendarEventAction[] = [];
    this.actions.forEach((action) => {
      if (action.a11yLabel === 'Clone' || this.getDateWithoutTime(end) >= now) {
        actionsInEvent.push(action);
      }
    });
    return actionsInEvent;
  }

  getDateWithoutTime(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getUTCDate());
  }
}
