import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlatpickrModule } from 'angularx-flatpickr';
import { CalendarModule, DateAdapter, CalendarNativeDateFormatter, CalendarDateFormatter, DateFormatterParams } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpClientModule } from '@angular/common/http';
import { ContextMenuModule } from 'ngx-contextmenu';
import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';


import { AppComponent } from './app.component';
import { CalendarioComponent } from './componentes/calendario/calendario.component';
import { EventoComponent } from './componentes/calendario/formulario/evento/evento.component';
import { CabinasOcupadasComponent } from './componentes/calendario/formulario/errores/cabinas-ocupadas/cabinas-ocupadas.component';

class CustomDateFormatter extends CalendarNativeDateFormatter {

  public dayViewHour({ date, locale }: DateFormatterParams): string {
    return new Intl.DateTimeFormat('ca', {
      hour: 'numeric',
      minute: 'numeric'
    }).format(date);
  }

  public weekViewHour({ date, locale }: DateFormatterParams): string {
    return new Intl.DateTimeFormat('ca', {
      hour: 'numeric',
      minute: 'numeric'
    }).format(date);
  }

}

@NgModule({
  declarations: [
    AppComponent,
    CalendarioComponent,
    EventoComponent,
    CabinasOcupadasComponent
  ],
  imports: [
    BrowserAnimationsModule,
    BrowserModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModalModule,
    HttpClientModule,
    AngularFontAwesomeModule,
    FlatpickrModule.forRoot(),
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory
    }, {
      dateFormatter: {
        provide: CalendarDateFormatter,
        useClass: CustomDateFormatter
      }
    }),
    ContextMenuModule.forRoot({
      useBootstrap4: true
    }),
    NgbPopoverModule
  ],
  providers: [],
  bootstrap: [AppComponent],
  entryComponents: [
    EventoComponent
  ]
})
export class AppModule { }
