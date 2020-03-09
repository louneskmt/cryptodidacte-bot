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

const port = 8443;

app.set('port', port)
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

/**
 * Receives Account Acitivity events
 **/
app.post('/webhook/twitter', function(request, response) {
  console.log(request.body);
  if(request.body.hasOwnProperty('direct_message_events')) {
    events.eventEmitter.emit('dm', request.body.direct_message_events[0].users[0].id, request.body.direct_message_events[0].message_create.message_data.text)

  }
  response.send('200 OK')
})

app.get('/webhook/twitter', function(request, response) {
  var crc_token = request.query.crc_token
  console.log("Verification CRC...");
  console.log(crc_token);
  if (crc_token) {
    var hash = security.get_challenge_response(crc_token,twitterApp.consumer_secret)

    response.status(200);
    response.send({
      response_token: 'sha256=' + hash
    })
  } else {
    response.status(400);
    response.send('Error: crc_token missing from request.')
  }
});

app.get('/webhook/status', function(req, res){
  Twitter.getSubscriptions(res);
  Twitter.getAllWebhooksStatus(res);
  Twitter.triggerVerification(twitterApp.webhook_id, res);
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
  Twitter.sendTextMessage('986994912565620736', 'Node app is running on port ' + app.get('port'));
  events.eventEmitter.emit('dm', '986994912565620736', 'lnbc2u1p0xvf68pp5lfanv7339rphk8tlqjfawl2v075c9m4skdmd48hnm4uwhcucq2jqdqu2askcmr9wssx7e3q2dshgmmndp5scqzpgxqrrss0785tmdm7c0r7jeu7jk5nm589fnjql50tavglxkh6x0egyp6lslkn32spkgm5j46geh9y3c36gaqzsw3z85z79k6fzmp4lxj8aylxccpz84xm2');
});
