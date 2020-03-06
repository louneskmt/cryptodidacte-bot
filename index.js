const T = require('./src/Twit.js');
const twitterApp = require('./config.js');
const security = require('./src/security.js');

// Require Express (HTTP server)
// http://expressjs.com
var express = require("express");
const bodyParser = require('body-parser')
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
  console.log("POST")
  console.log(request.body)
  // var events = JSON.parse(request.body)

  if(events.hasOwnProperty('direct_message_events')) {
    console.log("Message")
    console.log(events.direct_message_events.message_create)
  }

  // socket.io.emit(socket.activity_event, {
  //   internal_id: uuid(),
  //   event: request.body
  // })
  //


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
