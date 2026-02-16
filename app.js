require("dotenv").config();

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const config = require('./config');
const Response = require('./lib/Response')
const I18n = require('./lib/I18n');
const Database = require('./db/Database');

//Swagger
const swaggerUi = require('swagger-ui-express');
const swaggerDoc = require('./swagger_output.json');

//Security Imports
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');

new Database().connect(config.CONNECTION_STRING);

var app = express();

// 1. Helmet: HTTP Başlık güvenliği
app.use(helmet());

// 2. CORS: Sadece izin verilen domainler erişsin
app.use(cors({
    origin: config.HTTP.CORS.ORIGIN,
    methods: config.HTTP.CORS.METHODS
}));

// 3. Rate Limit: DDoS ve Brute-Force koruması
const limiter = rateLimit({
    windowMs: config.HTTP.RATE_LIMIT.WINDOW_MS,
    max: config.HTTP.RATE_LIMIT.MAX,
    message: {
        code: 429,
        error: { message: "Too many requests, please try again later." }
    }
});
app.use('/api', limiter); // Sadece /api rotalarına limit koyuyoruz

// 4. Mongo Sanitize: NoSQL Injection koruması
app.use(mongoSanitize());

// 5. HPP: Parametre kirliliği koruması
app.use(hpp());

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