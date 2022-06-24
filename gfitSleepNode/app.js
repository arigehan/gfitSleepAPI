var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);


// NEW CONTENT
// installed dependencies 
const { google } = require('googleapis');
const request = require('request');
const cors = require('cors');
const urlParse = require('url-parse');
const queryParse = require('query-string');
const bodyParser = require('body-parser');
const axios = require('axios');

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// get request
app.get('/getURLTing', (req, res) => {
  const oauth2Client = new google.auth.OAuth2(
    //client id
    '491645927911-o93tk3d9934pbpg0c7u0aq2ejj4hfkmc.apps.googleusercontent.com',
    //client secret
    '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',
    //redirect to link
    'http://localhost:3001/steps'
  );
  const scopes = ['https://www.googleapis.com/auth/fitness.activity.read profile email openid'];

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    state: JSON.stringify({
      callbackUrl: req.body.callbackUrl,
      userID: req.body.userid
    })
  })
  request(url, (err, response, body) => {
    console.log('error: ', err);
    console.log('statusCode: ', response && response.statusCode);
    res.send({ url });
  })
});

app.get('/steps', async (req, res) => {
  const queryURL = new urlParse(req.url);
  const code = queryParse.parse(queryURL.query).code;

  //needed line below to get code after i authorized permission
  //console.log(code);

  const oauth2Client = new google.auth.OAuth2(
    //client id
    '491645927911-o93tk3d9934pbpg0c7u0aq2ejj4hfkmc.apps.googleusercontent.com',
    //client secret
    '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',
    //redirect to link
    'http://localhost:3001/steps'
  );

  const tokens = await oauth2Client.getToken(code);
  //console.log(tokens);
  res.send('You Google Fit Account has been connected');
  
  try {
    axios.get('https://www.googleapis.com/fitness/v1/users/me/sessions?startTime=1985-04-12T23:20:50.52Z&activityType=72', {
      headers: {authorization: 'Bearer ' + tokens.tokens.access_token},
    })
      .then(response => {
        data = response.data
       console.log(data)
      })
      .catch(error => {
        if (error.response) {
          //get HTTP error code
          console.log(error.response.status)
          console.log(error.message)
          console.log(error.response.data)
          console.log(error.response.data.errors)
        } else {
          console.log(error.message)
          console.log(error.data)
        }
      })
/*
data: {
        aggregateBy: [{
          dataTypeName: 'com.google.step_count.delta',
          dataSourceId: 'derived:com.google.step_count.delta:com.google.android.gms:estimated_steps'
        }],
        bucketByTime: { durationMillis: 1000*60*60*24 }, // this means it will show one day at a time instead of the bursts you walked in
        startTimeMillis: 1654747914419, //get from https://currentmillis.com
        endTimeMillis: 1654834314419

        */


/*
const result = await axios({
      method: 'GET',
      headers: {
        authorization: 'Bearer ' + tokens.tokens.access_token
      },
      'Content-Type': 'application/json',
      url: `https://www.googleapis.com/fitness/v1/users/userId/sessions`,
      /*data: {
        aggregateBy: [{
          dataTypeName: 'com.google.sleep.segment',
          dataSourceId: 'derived:com.google.sleep.segment:com.google.android.gms:sleep_from_activity<-raw:com.google.activity.segment:com.heytap.wearable.health:stream_sleep'
        }],
        bucketByTime: { durationMillis: 1000*60*60*24 },
        startTimeMillis: 1655510511171, //get from https://currentmillis.com
        endTimeMillis: 1655596911171 
      } // * / this was a break... 
    });
*/


  } catch (e) {
    console.log(e);
  }


})
  


//app.listen(port, () => console.log(`Google Fit is listening on port ${port}`));

// END OF NEW CONTENT


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

module.exports = app;
