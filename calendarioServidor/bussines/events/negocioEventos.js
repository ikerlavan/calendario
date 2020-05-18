const { google } = require('googleapis');

const CALENDAR_ID = [
  '3ogj615nk37q3rjea1gmedbts0@group.calendar.google.com',
  'ebndia3jm60cb3v0lhhjf6gkdo@group.calendar.google.com',
];

const emailDomain = '@group.calendar.google.com';

// const filterBy = {
//       calendarId: 'primary',
//       timeMin: (new Date(filter.timeMin).toISOString()) || (new Date('2014-01-01')).toISOString(),
//       timeMax: (new Date(filter.timeMax).toISOString())  || (new Date()).toISOString(),
//       maxResults: filter.maxResults ,
//       singleEvents: true,
//       orderBy: 'startTime',
//       q:filter.keyword
//     }
// debug('Searching with filter %j', filterBy)
// const events = await calendar.events.list(filterBy)

exports.insertar = function (auth, idCalendario, evento) {
  return new Promise(function (resolve, reject) {
    const calendar = google.calendar({ version: 'v3', auth });

    let calendarId = evento.calendarId + emailDomain;
    delete evento.calendarId;
    console.log('evento');
    console.log(evento);

    // evento.start.dateTime = evento.start.dateTime.toISOString()
    // evento.end.dateTime = evento.end.dateTime.toISOString()

    calendar.events
      .insert({
        calendarId: idCalendario + emailDomain,
        requestBody: evento,
      })
      .then((eventoInsertado) => {
        console.log(eventoInsertado);
        resolve(eventoInsertado);
      })
      .catch((error) => reject(error));
  });
};

exports.modificar = function (auth, idCalendario, idEvento, evento) {
  return new Promise(function (resolve, reject) {
    const calendar = google.calendar({ version: 'v3', auth });
    console.log('IdEvento');
    console.log('###############################################');
    console.log(idEvento);
    console.log('IdCalendario');
    console.log('###############################################');
    console.log(idCalendario);
    delete evento.calendarId;
    // delete evento.id
    // delete evento.calendarId
    // delete evento.calendarId
    calendar.events
      .patch({
        calendarId: idCalendario + emailDomain,
        eventId: idEvento,
        requestBody: evento,
      })
      .then((eventoModificado) => {
        // console.log(eventoModificado)
        resolve(eventoModificado);
      })
      .catch((error) => reject(error));
  });
};

exports.borrar = function (auth, idEvento, idCalendario) {
  return new Promise(function (resolve, reject) {
    const calendar = google.calendar({ version: 'v3', auth });

    calendar.events
      .delete({
        calendarId: idCalendario + emailDomain,
        eventId: idEvento,
      })
      .then((idEvento) => {
        console.log(idEvento);
        resolve(idEvento);
      })
      .catch((error) => reject(error));
  });
};

exports.buscarPorId = function (auth, id) {};

/* Listar eventos desde una fecha*/
exports.listar = function (auth, criterio) {
  return new Promise(function (resolve, reject) {
    const calendar = google.calendar({ version: 'v3', auth });
    let cal = [];
    console.log(criterio);

    if (null == criterio.calendarioId) {
      findAllCalendarEventsFromAllCalendars(criterio);
    }

    if (null != criterio.calendarioId) {
      let filterBy = {
        calendarId: criterio.calendarioId + emailDomain,
        timeMin: new Date(criterio.fechaMin).toISOString(),
        timeMax:
          new Date(criterio.fechaMax).toISOString() ||
          new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString(),
        maxResults: criterio.maxResults || 100,
        singleEvents: true,
        orderBy: 'startTime',
        q: criterio.q,
      };
      // if (undefined !== criterio.q) {
      //   filterBy.q = q;
      // }

      calendar.events
        .list(filterBy)
        .then((res) => {
          manageEvents(cal, res, filterBy.calendarId);
          resolve(cal);
        })
        .catch((err) => {
          reject(console.log('The API returned an error: ' + err));
        });
    }

    const manageEvents = (cal, res, calendario) => {
      if (res.data.items.length <= 0) {
        console.log('No upcoming events found for ' + calendario);
        return false;
      }

      for (let event of res.data.items) {
        cal.push(event);
      }
    };

    const getFilterBy = (criterio) => {
      let filter = {};
      if (q) {
        filter.q = q;
      }
      filter.calendarId = criterio.calendarioId + emailDomain;
      filter.timeMin = new Date(criterio.fechaMin).toISOString();
      filter.timeMax =
        new Date(criterio.fechaMax).toISOString() ||
        new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString();
      filter.maxResults = criterio.maxResults || 100;
      filter.singleEvents = true;
      filter.orderBy = 'startTime';
      return filter;
    };

    findAllCalendarEventsFromAllCalendars = (criterio) => {
      let today = new Date();

      let filterBy = {
        calendarId: CALENDAR_ID[0],
        // timeMin: (fechaMin).toISOString() || (new Date(criterio.timeMin).toISOString()), // || (fechaMin).toISOString(),
        // timeMax: (new Date()).toISOString() || (new Date(criterio.timeMax).toISOString()), //  || (new Date()).toISOString(),
        timeMin: new Date(criterio.fechaMin).toISOString(),
        timeMax:
          new Date(criterio.fechaMax).toISOString() ||
          new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString(),
        maxResults: criterio.maxResults || 100,
        singleEvents: true,
        orderBy: 'startTime',
        eventoModificado,
      };

      calendar.events
        .list(filterBy)
        .then((res) => {
          manageEvents(cal, res, filterBy.calendarId);
          // if(eventos.length>0){
          //   console.log(eventos)
          //   cal.push(eventos);
          //   console.log(cal)
          // }

          filterBy.calendarId = CALENDAR_ID[1];
          return calendar.events.list(filterBy);
        })
        .then((res) => {
          manageEvents(cal, res, filterBy.calendarId);
          // if(eventos.length>0){
          //   cal.push(eventos);
          // }
          resolve(cal);
        })
        .catch((err) => {
          reject(console.log('The API returned an error: ' + err));
        });
    };
  });
};

exports.listarCabinasOcupadas = function (auth, criterio, evento) {
  return new Promise(function (resolve, reject) {
    const calendar = google.calendar({ version: 'v3', auth });
    let cal = [];
    console.log('exports.listarCabinasOcupadas');
    if (null != criterio.calendarioId) {
      let filterBy = {
        calendarId: criterio.calendarioId + emailDomain,
        timeMin: new Date(criterio.fechaMin).toISOString(),
        timeMax:
          new Date(criterio.fechaMax).toISOString() ||
          new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString(),
        maxResults: criterio.maxResults || 100,
        singleEvents: true,
        orderBy: 'startTime',
        q: criterio.q,
      };
      // if (undefined !== criterio.q) {
      //   filterBy.q = q;
      // }

      calendar.events
        .list(filterBy)
        .then((res) => {
          manageEvents(cal, res, filterBy.calendarId);
          // filterReservas(cal, evento);
          console.log('cabinas ocupadas');
          console.log(cal);
          resolve(cal);
        })
        .catch((err) => {
          reject(console.log('The API returned an error: ' + err));
        });

      const manageEvents = (cal, res, calendario) => {
        if (res.data.items.length <= 0) {
          console.log('No upcoming events found for ' + calendario);
          return false;
        }

        for (let event of res.data.items) {
          cal.push(event);
        }
      };

      const filterReservas = (cal, cita) => {
        cal = cal.filter((iEvent) => {
          const start = cita.start;
          const end = cita.end;

          const cabinaIEvent = iEvent.description
            .split('\n')[3]
            .split(':')[1]
            .trim();
          const startIEvent = new Date(iEvent.start.dateTime).toISOString();
          const endIEvent = new Date(iEvent.end.dateTime).toISOString();
          if (iEvent.meta.reserva.id === cita._id) {
            console.log('iEvent.meta.reserva.id == cita.get("_id").value');
            console.log(iEvent.meta.reserva.id === cita._id);
            return false;
          }

          if (
            start === end &&
            cita.cabina === cabinaIEvent &&
            iEvent.meta.reserva.id !== cita._id
          ) {
            console.log('Misma fecha y hora y cabina');
            return true;
          }

          if (start === startIEvent && end === iEvent.end) {
            console.log('start == iEvent.start && end == iEvent.end');
            return true;
          }
          // console.log('Condición');
          // console.log(
          //   ((start > startIEvent || start < startIEvent) &&
          //     end <= iEvent.end) ||
          //     end >= iEvent.start
          // );
          // console.log(
          //   (start > iEvent.start || start < iEvent.start) &&
          //     (end <= iEvent.end || end >= iEvent.start) &&
          //     null != iEvent.meta.reserva.des.cabina &&
          //     cita.cabina === cabinaIEvent
          // );

          // return (
          //   (start > iEvent.start || start < iEvent.start) &&
          //   (end <= iEvent.end || end >= iEvent.start) &&
          //   null != iEvent.meta.reserva.des.cabina &&
          //   cita.cabina === cabinaIEvent
          // );
        });
      };
    }
  });
};
