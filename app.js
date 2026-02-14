require("dotenv").config();

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const config = require('./config');
const Response = require('./lib/Response')
const I18n = require('./lib/I18n');

var app = express();

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    // Header'dan dili al, yoksa config'deki default'u kullan
    // Postman'de header key: "Accept-Language", value: "TR" veya "EN" olacak
    let lang = req.headers['accept-language'] || config.DEFAULT_LANG; 
    
    // Sınıfın yeni bir örneğini oluştur
    const i18n = new I18n(lang);
    
    // req objesine translate fonksiyonunu yapıştır. Artık her yerden erişilebilir.
    req.t = (key, params) => i18n.translate(key, lang, params);
    
    next();
});

// Dinamik routing 
app.use('/api', require('./routes/index'));

// 404 Yakalayıcı
app.use(function(req, res, next) {
  next(createError(404));
});

// HATA YAKALAYICI (Error Handler)
app.use(function(err, req, res, next) {
  const errorResponse = Response.errorResponse(err);
  console.error("APP ERROR:", err);
  res.status(errorResponse.code).json(errorResponse);
});

module.exports = app;