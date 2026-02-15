require("dotenv").config();

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const config = require('./config');
const Response = require('./lib/Response')
const I18n = require('./lib/I18n');

//Swagger
const swaggerUi = require('swagger-ui-express');
const swaggerDoc = require('./swagger_output.json');

var app = express();

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// 1. ÖNCE DİL AYARLARI (req.t her yerde olsun)
app.use((req, res, next) => {
    let lang = req.headers['accept-language'] || config.DEFAULT_LANG; 
    const i18n = new I18n(lang);
    req.t = (key, params) => i18n.translate(key, lang, params);
    next();
});

// 2. SONRA SWAGGER (Adresi /api-docs olarak düzelttim)
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));

// 3. SONRA API ROTALARI
app.use('/api', require('./routes/index'));

// 4. ANA SAYFA YÖNLENDİRMESİ
app.get('/', (req, res) => {
    res.redirect('/api/docs'); 
});

// 404 Yakalayıcı
app.use(function(req, res, next) {
  next(createError(404));
});

// HATA YAKALAYICI (Error Handler)
app.use(function(err, req, res, next) {
  const errorResponse = Response.errorResponse(err);
  // console.error("APP ERROR:", err); // İstersen açabilirsin
  res.status(errorResponse.code).json(errorResponse);
});

module.exports = app;