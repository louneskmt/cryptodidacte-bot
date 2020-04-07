const {__,  __json} = require("./src/logger.js");

// Require Events handler and fs to read files
const Session = require('./endpoints/session.js');
const globalEvents = require('./src/events/globalEvents.js');
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
const expressSession = require('express-session');
const ejs = require("ejs");

let Database = require('./src/database.js')
global.database = new Database("cryptodidacte");
database.connect();

// HTTPS Server config
var app = express();
app.set('port', 8443)
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(helmet())
app.use(expressSession({
  secret: process.env.SALT,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true, expires: new Date(Date.now() + 30*60*1000)}
}))
/**
 * Receives Account Activity events
 **/
app.post('/webhook/twitter', function(req, res) {
  let for_user_id = req.body.for_user_id;

  switch (for_user_id) {
    case twitterConfig.user_id_bot:
      globalEvents.emit('bot', req.body);
      globalEvents.emit('logs', 'bot', req.body);
      break;
    case twitterConfig.user_id_cryptodidacte:
      globalEvents.emit('cryptodidacte', req.body);
      globalEvents.emit('logs', 'cryptodidacte', req.body);
      break;
    default:
      __('Unknow request target');
      break;
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

app.get('/done', function(req, res) {
  console.log(req.query);
  console.log(req.body);
});

/**
 * Returns index HTML page
 */
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.get('/connect', function(req, res){
  let continueTo = req.query.continueTo;
  ejs.renderFile(__dirname + "/public/connect.ejs", {continueTo}, function(err,str){
    if(err) __(err,9);
    res.status(200).send(str);
  })
});
app.get("/index", function(req, res){
  let now = new Date();
  let time = req.session.timestamp;
  let delta = now - time;
  
  if(delta > 1000*60*30 || !req.session.isValid){ //30mins
    req.session.isValid = false;
    res.redirect("/connect");
  }else{
    ejs.renderFile(__dirname + "/public/index.ejs", {view: ""}, function(err,str){
      if(err) __(err,9);
      res.status(200).send(str);
    })
  }
})
app.get("/view/:viewName", function(req, res){
  let now = new Date();
  let time = req.session.timestamp;
  let delta = now - time;
  let viewName = req.params.viewName || null;

  
  if(delta > 1000*60*30 || !req.session.isValid){ //30mins
    req.session.isValid = false;
    res.redirect(`/connect${viewName ? "?continueTo="+viewName : "" }`);
  }else{
    ejs.renderFile(__dirname + "/public/index.ejs", {view: viewName}, function(err,str){
      res.status(200).send(str);
    })
  }
});

app.post("/login", async function(req, res){
  __(req.body)
  let username = req.body.username || "";
  let password = req.body.password || "";
  let session = new Session({username, password});
  let status = await session.create();
  
  if(status === -1){
    return res.status(403).send("-1");
  }else{
    req.session.timestamp = session.timestamp;
    req.session.id = session.id;
    req.session.isValid = session.isValid;
  
    return res.status(200).send("0");
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
