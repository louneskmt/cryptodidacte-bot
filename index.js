const twitterApp = require('./config.js');
const security = require('./src/security.js');
const events = require('./src/events.js');
var Twitter = require('./src/Twit');

// Require Express (HTTP server)
// http://expressjs.com
var express = require("express");
const bodyParser = require('body-parser');
const https = require('https');
var fs = require('fs');
var app = express();
const portHttps = 8443;

app.set('port', portHttps)
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(function (req, res, next) {
  if (req.secure) {
    // request was via https, so do no special handling
    next();
  } else {
    // request was via http, so redirect to https
    res.redirect('https://louneskmt.com' + req.url);
  }
});

/**
 * Receives Account Acitivity events
 **/
app.post('/webhook/twitter', function(request, response) {
  console.log(request.body)
  if(request.body.hasOwnProperty('direct_message_events')) {
    events.eventEmitter.emit('dm', Object.keys(request.body.users)[0], request.body.direct_message_events[0].message_create)
  }
  response.send(200)
})

app.get('/webhook/twitter', function(request, response) {
  var crc_token = request.query.crc_token
  console.log("Verification CRC...");
  console.log(crc_token);
  if (crc_token) {
    var hash = security.get_challenge_response(crc_token,twitterApp.consumer_secret)

    response.status(200).send({
      response_token: 'sha256=' + hash
    });
  } else {
    response.status(400).send('Error: crc_token missing from request.')
  }
});

app.get('/webhook/status', function(req, res){
  Twitter.getSubscriptions();
  Twitter.getAllWebhooksStatus();
  // Twitter.triggerVerification(twitterApp.webhook_id);
  res.status(200).send()
});

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

https.createServer({
  key: fs.readFileSync('./certs/privkey.pem'),
  cert: fs.readFileSync('./certs/fullchain.pem')
}, app)
.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'))
});
