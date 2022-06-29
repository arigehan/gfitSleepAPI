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
app.get('/getSleep', (req, res) => {
  const oauth2Client = new google.auth.OAuth2(
    //client id
    '79485309173-jutqi66l6q5um7abflpsi4t2f0t4o1jr.apps.googleusercontent.com',
    //client secret
    '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',
    //redirect to link
    'http://localhost:3001/sleep'
  );
  const scopes = ['https://www.googleapis.com/auth/fitness.sleep.read', 'https://www.googleapis.com/auth/fitness.activity.read', 'profile', 'email', 'openid'];

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

app.get('/sleep', async (req, res) => {
  const queryURL = new urlParse(req.url);
  const code = queryParse.parse(queryURL.query).code;

  //needed line below to get code after i authorized permission
  //console.log(code);

  const oauth2Client = new google.auth.OAuth2(
    //client id
    '79485309173-jutqi66l6q5um7abflpsi4t2f0t4o1jr.apps.googleusercontent.com',
    //client secret
    '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',
    //redirect to link
    'http://localhost:3001/sleep'
  );

  const {tokens} = await oauth2Client.getToken(code);
  //console.log(tokens, 'token');
  res.send('You Google Fit Account has been connected');
  
  try {
    axios.get('https://fitness.googleapis.com/fitness/v1/users/me/sessions?activityType=72&includeDeleted=true&startTime=2022-06-19T23%3A20%3A50.52Z', {
      headers: {authorization: 'Bearer ' + tokens.access_token},
      //need to get refresh token 1//04Dc1V8pPp3RLCgYIARAAGAQSNwF-L9IrI4GDjDHF2mDeRa_387nZElRB9j43gW4XemB_WNT0nvtbxqt9kTlTsdv5_xq1TR9FFQE
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
  } catch (e) {
    console.log(e);
  }
/* //UNAUTHENTICATED ERROR: 
  try {
    axios.post('https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate', {
      headers: {
        authorization: 'Bearer ' + tokens.access_token,
        'Content-Type': 'application/json'
      },
      data: {
        aggregateBy: [{
            dataTypeName: "com.google.sleep.segment"
        }],
        endTimeMillis: 1656169552629,
        startTimeMillis: 1655705515962
      }
    })
      .then(response => {
       data = response.data
       console.log(data)
      })
      .catch(error => {
        if (error.response) {
          //get HTTP error code
          console.log(error.response.status) //401
          console.log(error.message) //Request failed with status code 401
          console.log(error.response.data) // [object Object]
          console.log(error.response.data.errors) // undefined
        } else {
          console.log(error.message)
          console.log(error.data)
        }
      })
  } catch (e) {
    console.log(e);
  }
*/

  var axios = require('axios');
  var data = JSON.stringify({
    "aggregateBy": [
      {
        "dataTypeName": "com.google.sleep.segment"
      }
    ],
    "endTimeMillis": 1656539467129,
    "startTimeMillis": 1655705515962
  });
  
  var config = {
    method: 'post',
    url: 'https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate',
    headers: { 
      'Authorization': 'Bearer ' + tokens.access_token, 
      'Content-Type': 'application/json'
    },
    data : data
  };
  
  axios(config)
  .then(function (response) {
    console.log(JSON.stringify(response.data));
  })
  .catch(function (error) {
    console.log(error);
  });
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
