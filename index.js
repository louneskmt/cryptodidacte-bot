const twitterApp = require('./config.js');
const security = require('./src/security.js');
const events = require('./src/events.js');

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
  if(request.body.hasOwnProperty('direct_message_events')) {
    events.eventEmitter.emit('dm', request.body.direct_message_events[0].message_create)
    console.log(request);
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
