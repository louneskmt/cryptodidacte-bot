const {__,  __json} = require("./src/logger.js");

// Require Events handler and fs to read files
const Session = require('./endpoints/session.js');
const eventEmitter = require('./src/events.js');
const fs = require('fs');

// Require Twitter related modules
const { twitterConfig } = require('./config.js');
const security = require('./src/security.js');
const Twitter = require('./src/Twit');

// Require Express (HTTPS server)
const express = require("express");
const bodyParser = require('body-parser');
const https = require('https');
const helmet = require('helmet');

let Database = require('./src/database.js')
global.database = new Database("cryptodidacte");
database.connect();

// HTTPS Server config
var app = express();
app.set('port', 8443)
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(helmet())

/**
 * Receives Account Activity events
 **/
app.post('/webhook/twitter', function(req, res) {
  eventEmitter.emit('logs', req.body);

  if(req.body.hasOwnProperty('direct_message_events')) {
    var message_create_object = req.body.direct_message_events[0].message_create;
    var user_id = message_create_object.sender_id;

    if(user_id != twitterConfig.user_id_bot) {
      eventEmitter.emit('dm', user_id, message_create_object);
    }

  }
  if(req.body.hasOwnProperty('tweet_create_events')) {
    eventEmitter.emit('tweet', req.body.tweet_create_events[0]);
  }
  res.status(200).end();
})

/**
 * Security Twitter endpoint
 */
app.get('/webhook/twitter', function(req, res) {
  var crc_token = req.query.crc_token;
  __("Verification CRC...\n"+crc_token, 2);
  if (crc_token) {
    var hash = security.get_challenge_response(crc_token, twitterConfig.consumer_secret);
    res.status(200).send({ response_token: 'sha256=' + hash });
  } else {
    res.status(400).send('Error: crc_token missing from request.');
  }
});

/**
 * Returns index HTML page
 */
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.get('/admin', function(req, res){
  res.sendFile(__dirname + '/public/index.html');
});

app.post("/login", async function(req, res){
  let username = req.body.username || "";
  let password = req.body.password || "";
  let session = new Session({username, password});
  let status = await session.create();
  
  if(status === -1){
    return res.status(403).send("-1");
  }else if(status === 0){
    return res.status(200).send(status);
  }
})

/**
 * Serve static files from directory public
 */
app.use(express.static('public'))

/**
 * Returns logs
 */
app.get('/logs', function(req, res){
  res.sendFile(__dirname + '/logs/main.log');
});

// Starts server
https.createServer({
  key: fs.readFileSync('./certs/privkey.pem'),
  cert: fs.readFileSync('./certs/fullchain.pem')
}, app)
.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
