var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
//var eventosRouter = require('./routes/eventos');
var usersRouter = require('./routes/users');

var createError = require('http-errors');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//Añadimos (si hay) las funciones interceptoras
app.use(interceptorCORS)

app.use('/', indexRouter);
//app.use('/eventos', eventosRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

////////////////////////////
//Interceptores en Express//
////////////////////////////
function interceptorCORS(request, response, next){
    console.log("CORS")
    //Incluye configuración para BASIC AUTHENTICATION
    response.header("Access-Control-Allow-Origin", "*");
    response.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
    response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");

    if (request.method.toUpperCase() == 'OPTIONS'){
        response.end()
        return
    }

    next();
}

module.exports = app;
