require('dotenv').config();

const path = require('path');
const express = require('express');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const serveFavicon = require('serve-favicon');
const bodyParser = require('body-parser');
const routes = require('./routes');

const {
	STATIC_DIR='public',
	VIEWS_DIR='public,views',
	FAVICON_PATH='public/favicon.ico',
} = process.env;

const split = (value, char = ',') => (
	value.replace(/\s+/g, '').split(char)
);

const app = express();
app.enable('trust proxy');
app.use('/', routes);
app.set('view engine', 'ejs');
app.set('views', split(VIEWS_DIR).map((value) => path.resolve(value)));
app.use(morgan('dev'));
app.use(compression());
app.use(serveFavicon(FAVICON_PATH));
app.use(express.static(path.resolve(STATIC_DIR)));
app.use(bodyParser.urlencoded({ extended: false, limit: '5mb' }));
app.use(bodyParser.json({ limit: '5mb' }));
app.use(cookieParser());

module.exports = app;
