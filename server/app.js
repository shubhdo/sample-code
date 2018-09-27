const env = require('dotenv');
const envfile =
  process.env.NODE_ENV === 'production' ? '.prod.env' : '.dev.env';
env.config({ path: `${__dirname}/environments/${envfile}` });
const express = require('express');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const socketInit = require('./lib/socket');

mongoose.Promise = global.Promise;
mongoose
  .connect(process.env.MONGO_URL + '/' + process.env.DB_NAME, {})
  .catch(err => console.log(err));

const app = express();

// initiate socket
socketInit(app);

// view engine setup
app.use(logger('dev'));

app.use(bodyParser.json());

app.use(
  bodyParser.urlencoded({
    extended: false
  })
);

app.use(cookieParser());

app.use(function(req, res, next) {
  // console.log(JSON.parse(req.body.query));
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-Requested-With,content-type, Authorization'
  );
  next();
});

// enabling cors
app.options('*', cors());

require('./lib/routes')(app);
require('./swagger/swagger-ui')(app);
require('./graphql/graphql-server')(app);
app.use(function(req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Error handler
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res
    .status(err.status || 500)
    .json({
      status: false,
      error: err,
      code: err.status || 500
    })
    .end();

  next();
});

module.exports = app;
