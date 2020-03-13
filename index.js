// Require Events handler and fs to read files
const eventEmitter = require('./src/events.js');
const fs = require('fs');

// Require Twitter related modules
const twitterConfig = require('./config.js');
const security = require('./src/security.js');
const Twitter = require('./src/Twit');

// Require Express (HTTPS server)
const express = require("express");
const bodyParser = require('body-parser');
const https = require('https');

// HTTPS Server config
var app = express();
app.set('port', 8443)
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

/**
 * Receives Account Activity events
 **/
app.post('/webhook/twitter', function(req, res) {
  console.log(req.body)
  if(req.body.hasOwnProperty('direct_message_events')) {
    var user_id = Object.keys(req.body.users)[0];
    var message_create_object = req.body.direct_message_events[0].message_create;
    eventEmitter.emit('dm', user_id, message_create_object);
  }
  res.sendStatus(200);
})

/**
 * Security Twitter endpoint
 */
app.get('/webhook/twitter', function(req, res) {
  var crc_token = req.query.crc_token;
  console.log("Verification CRC...\n", crc_token);
  if (crc_token) {
    var hash = security.get_challenge_response(crc_token, twitterConfig.consumer_secret);
    res.sendStatus(200).send({ response_token: 'sha256=' + hash });
  } else {
    res.sendStatus(400).send('Error: crc_token missing from request.');
  }
});

/**
 * Returns index HTML page
 */
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

// Starts server
https.createServer({
  key: fs.readFileSync('./certs/privkey.pem'),
  cert: fs.readFileSync('./certs/fullchain.pem')
}, app)
.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
