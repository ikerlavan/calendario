import { LOCALE_ID, Inject, Injectable } from '@angular/core';
import { CalendarEventTitleFormatter, CalendarEvent } from 'angular-calendar';
import { DatePipe } from '@angular/common';

@Injectable()
export class CustomEventTitleFormatter extends CalendarEventTitleFormatter {
  constructor(@Inject(LOCALE_ID) private locale: string) {
    super();
  }

  // you can override any of the methods defined in the parent class

  month(event: CalendarEvent): string {
    return `<b> ${event.title}</b>
       - <b>${new DatePipe(this.locale).transform(
      event.start,
      'HH:mm',
      this.locale
    )} - ${new DatePipe(this.locale).transform(
      event.end,
      'HH:mm',
      this.locale
    )}</b>`;
  }

  monthTooltip(event: CalendarEvent): string {
    return `<b> ${event.title}</b>
    - <b>${new DatePipe(this.locale).transform(
      event.start,
      'HH:mm',
      this.locale
    )} - ${new DatePipe(this.locale).transform(
      event.end,
      'HH:mm',
      this.locale
    )}</b>`;
  }

  week(event: CalendarEvent): string {
    return `<b> ${event.title}</b>
    - <b>${new DatePipe(this.locale).transform(
      event.start,
      'HH:mm',
      this.locale
    )} - ${new DatePipe(this.locale).transform(
      event.end,
      'HH:mm',
      this.locale
    )}</b>`;
  }

  weekTooltip(event: CalendarEvent): string {
    return `<b> ${event.title}</b>
    - <b>${new DatePipe(this.locale).transform(
      event.start,
      'HH:mm',
      this.locale
    )} - ${new DatePipe(this.locale).transform(
      event.end,
      'HH:mm',
      this.locale
    )}</b>`;
  }

  day(event: CalendarEvent): string {
    return `<b> ${event.title}</b>
    - <b>${new DatePipe(this.locale).transform(
      event.start,
      'HH:mm',
      this.locale
    )} - ${new DatePipe(this.locale).transform(
      event.end,
      'HH:mm',
      this.locale
    )}</b>`;
  }

  dayTooltip(event: CalendarEvent): string {
    return `<b> ${event.title}</b>
    - <b>${new DatePipe(this.locale).transform(
      event.start,
      'HH:mm',
      this.locale
    )} - ${new DatePipe(this.locale).transform(
      event.end,
      'HH:mm',
      this.locale
    )}</b>`;
  }
}
