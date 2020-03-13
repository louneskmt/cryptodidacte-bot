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

/**
 * Receives Account Acitivity events
 **/
app.post('/webhook/twitter', function(req, res) {
  console.log(req.body)
  if(req.body.hasOwnProperty('direct_message_events')) {
    events.eventEmitter.emit('dm', Object.keys(req.body.users)[0], req.body.direct_message_events[0].message_create)
  }
  res.sendStatus(200)
})

app.get('/webhook/twitter', function(req, res) {
  var crc_token = req.query.crc_token
  console.log("Verification CRC...");
  console.log(crc_token);
  if (crc_token) {
    var hash = security.get_challenge_response(crc_token,twitterApp.consumer_secret)

    res.sendStatus(200).send({
      response_token: 'sha256=' + hash
    });
  } else {
    res.sendStatus(400).send('Error: crc_token missing from request.')
  }
});

app.get('/webhook/status', function(req, res){
  Twitter.getSubscriptions();
  Twitter.getAllWebhooksStatus();
  // Twitter.triggerVerification(twitterApp.webhook_id);
  res.sendStatus(200).send()
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
