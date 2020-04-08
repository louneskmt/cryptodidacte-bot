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
  cookie: { secure: true, expires: null}
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
  if(typeof req.session != "undefined" && isSessionValid(req.session)){
    return res.redirect("/index");
  }
  ejs.renderFile(__dirname + "/public/connect.ejs", {continueTo}, function(err,str){
    if(err) __(err,9);
    res.status(200).send(str);
  })
});
app.get("/index", function(req, res){
  let now = new Date();
  let time = req.session.timestamp;
  let delta = now - time;
  
  __(delta);
  if(delta > 1000*60*.1 || !req.session.isValid){ //30mins
    if(req.session){
      req.session.isValid = false;
      req.session.destroy();
      delete req.session.cookie;
    }
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
    req.session.destroy(function(err){
      if(err) return __(err,9);
      res.redirect(`/connect${viewName ? "?continueTo="+viewName : "" }`);
    });
  }else{
    ejs.renderFile(__dirname + "/public/index.ejs", {view: viewName}, function(err,str){
      res.status(200).send(str);
    })
  }
});
app.post("/login", async function(req, res){
  let username = req.body.username || "";
  let password = req.body.password || "";
  let session = new Session({username, password});
  let status = await session.create();
  
  if(status === -1){
    return res.status(403).send("-1");
  }else{
    req.session.timestamp = session.timestamp;
    req.session.token = session.id;
    req.session.isValid = true;

    __(req.session,2);
  
    return res.status(200).send("0");
  }
})

app.post("/db/get/", async function(req, res){
  if( !isSessionValid(req.session) && req.body.isTest==false){
    return res.status(403).send("-1");
  }

  let collection = req.body.collection || null;
  let filter = req.body.filter || {};

  if(!collection) return res.status(400).send("-1");

  // TODO: TO BE CHANGED : The default DB is now Cryptodidacte
  let queryResponse = await database.find(collection, filter);
  res.status(200).send(queryResponse);
})
app.post("/db/insert/", async function(req, res){
  if( !isSessionValid(req.session) && req.body.isTest==false){
    return res.status(403).send("-1");
  }

  let collection = req.body.collection || null;
  let entry = req.body.entry || null;

  if(!collection || !entry) return res.status(400).send("-1");

  // TODO: TO BE CHANGED : The default DB is now Cryptodidacte
  let queryResponse = await database.insert(collection, entry);
  res.status(200).send(queryResponse);
})

app.post("/db/update/", async function(req, res){
  if( !isSessionValid(req.session) && req.body.isTest==false ){
    return res.status(403).send("-1");
  }

  let collection = req.body.collection || null;
  let query = req.body.query || null;

  if(!collection || !query) return res.status(400).send("-1");

  // TODO: TO BE CHANGED : The default DB is now Cryptodidacte
  let queryResponse = await database.update(collection, query);
  res.status(200).send(queryResponse);
})

let isSessionValid = (session)=>{
  if(typeof session === "undefined") return false;
  
  let now = new Date();
  let time = session.timestamp;
  let delta = now - time;

  //*** TEST ***//
  if(delta > 1000*60*0.5 || !session.isValid){ //30mins
    session.isValid = false;
    return false
  }

  return true;
}

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
