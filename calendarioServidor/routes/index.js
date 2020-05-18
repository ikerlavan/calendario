var createError = require('http-errors');
var express = require('express');
let negocioEventos = require('../bussines/events/negocioEventos');
let authorization = require('../bussines/authorization');

var router = express.Router();

const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');

const secretsFile = 'credentials.json';
const secrets = JSON.parse(fs.readFileSync(secretsFile));

const CALENDAR_ID = [
  '3ogj615nk37q3rjea1gmedbts0@group.calendar.google.com',
  'ebndia3jm60cb3v0lhhjf6gkdo@group.calendar.google.com',
];
const SCOPES = ['https://www.googleapis.com/auth/calendar'];

/* GET home page. */
router.get('/eventos', listarEventos);
router.get('/eventos/:id', buscarEventoPorId);
router.post('/eventos/:idCalendario', insertarEvento);
router.put('/eventos/:idCalendario/:id', modificarEvento);
router.delete('/eventos/:idCalendario/:id', borrarEvento);
router.post('/eventos/', listarCabinasOcupadas);

function buscarEventoPorId(request, response) {
  authorization
    .generateOAuthClient(secrets, SCOPES)
    .then((auth) => {
      let id = request.params.id;
      negocioEventos
        .buscarPorId(auth, id)
        .then((evento) => response.json(evento))
        .catch((error) => {
          console.log(error);
          response.statusCode = 500;
          response.json(error);
        });
    })
    .catch((error) => {
      console.log(error);
      response.json(error);
    });
}

function borrarEvento(request, response) {
  authorization
    .generateOAuthClient(secrets, SCOPES)
    .then((auth) => {
      let idEvento = request.params.id;
      let idCalendario = request.params.idCalendario;
      negocioEventos
        .borrar(auth, idEvento, idCalendario)

        .then((evento) => response.json(evento))

        .catch((error) => {
          console.log(error);
          // response.statusCode = 500
          response.json(createError(500));
        });
    })
    .catch((error) => {
      console.log(error);
      response.json(error);
    });
}

function listarEventos(request, response) {
  console.log('listarEventos');
  authorization
    .generateOAuthClient(secrets, SCOPES)
    .then((auth) => {
      let criterio = JSON.parse(request.query.criterio);
      //let criterio = {'cri':'TODO', 'maxResults':10}
      console.log('Routes\n');
      console.log(criterio.fechaMin);
      negocioEventos
        .listar(auth, criterio)
        .then((eventos) => {
          console.log(eventos);
          response.json(eventos);
        })
        .catch((error) => {
          console.log(error);
          response.statusCode = 500;
          response.json(error);
        });
    })
    .catch((error) => {
      console.log(error);
      //response.statusCode = error.codigo
      response.json(error);
    });
}

function insertarEvento(request, response) {
  authorization
    .generateOAuthClient(secrets, SCOPES)
    .then((auth) => {
      let evento = request.body;
      let idCalendario = request.params.idCalendario;
      negocioEventos
        .insertar(auth, idCalendario, evento)
        .then((eventoInsertado) => response.json(eventoInsertado))
        .catch((error) => {
          console.log('=========================');
          console.log(error);
          response.json(createError(500));
        });
    })
    .catch((error) => {
      console.log(error);
      //response.statusCode = error.codigo
      response.json(error);
    });
}

function modificarEvento(request, response) {
  authorization.generateOAuthClient(secrets, SCOPES).then((auth) => {
    let evento = request.body;
    let idEvento = request.params.id;
    let idCalendario = request.params.idCalendario;
    evento.id = idEvento; //No nos fiamos el posible _id que venga en el JSON

    negocioEventos
      .modificar(auth, idCalendario, idEvento, evento)
      .then((eventoModificado) => response.json(eventoModificado))
      .catch((error) => {
        console.log(error);
        response.json(createError(500));
      });
  });
}

function listarCabinasOcupadas(request, response) {
  console.log('listarEventos');
  authorization
    .generateOAuthClient(secrets, SCOPES)
    .then((auth) => {
      let criterio = JSON.parse(request.query.criterio);
      let evento = request.body;
      console.log('evento');
      console.log(evento);
      negocioEventos
        .listarCabinasOcupadas(auth, criterio, evento)
        .then((eventos) => {
          console.log(eventos);
          response.json(eventos);
        })
        .catch((error) => {
          console.log(error);
          response.statusCode = 500;
          response.json(error);
        });
    })
    .catch((error) => {
      console.log(error);
      //response.statusCode = error.codigo
      response.json(error);
    });
}

module.exports = router;
