import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { CalendarEvent } from 'angular-calendar';

@Injectable({
  providedIn: 'root',
})
export class ClickActionService {
  private subject = new Subject<any>();

  constructor() {}

  sendAction(action: string, event: CalendarEvent) {
    this.subject.next({ action, event });
  }

  clearAction() {
    this.subject.next();
  }

  getAction(): Observable<any> {
    return this.subject.asObservable();
  }
}
