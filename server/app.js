import createError from 'http-errors';
import express from 'express';
import path, { dirname } from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import session from 'express-session';
import mysql from 'mysql';
import { fileURLToPath } from 'url';

import apiRouter from './routes/api.js';

var app = express();

var dbConnectionPool = mysql.createPool({
  host: process.env.ROOT_DOMAIN,
  multipleStatements: true
});

app.use(function(req, res, next) {
  req.pool = dbConnectionPool;
  next();
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(session({
  secret: 'a706835de79a2b4e90506f582af3676ac8361521',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.static(path.join(__dirname, '../client/build')));

var idCounter = 0;

app.use((req, res, next) => {
  if (!('id' in req.session)) {
    req.session.id = idCounter++;
  }
  next();
});

app.use('/api', apiRouter);

app.get('*', function(req, res, next) {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

export default app;