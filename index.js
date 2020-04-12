const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const https = require('https');
const helmet = require('helmet');
const expressSession = require('express-session');
const ejs = require('ejs');
const { __ } = require('./src/logger.js');
const security = require('./src/security.js');
const { twitterConfig } = require('./config.js');
const globalEvents = require('./src/events/globalEvents.js');
const schemas = require('./src/database/mongoose.js');

const Session = require('./endpoints/session.js');
const Database = require('./src/database.js');

const database = new Database('cryptodidacte');
database.connect();

// HTTPS Server config
const app = express();
app.set('port', 8443);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(helmet());
app.use(expressSession({
  secret: process.env.SALT,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true, expires: null },
}));

/**
 * Receives Account Activity events
 * */
app.post('/webhook/twitter', (req, res) => {
  const { for_user_id: forUserId } = req.body;

  switch (forUserId) {
    case twitterConfig.user_id_bot:
      globalEvents.emit('bot', req.body);
      break;
    case twitterConfig.user_id_cryptodidacte:
      globalEvents.emit('cryptodidacte', req.body);
      break;
    default:
      __('Unknow request target');
      break;
  }

  res.status(200).end();
});

/**
 * Security Twitter endpoint
 */
app.get('/webhook/twitter', (req, res) => {
  const { crc_token: crcToken } = req.query;
  __(`Verification CRC...\n${crcToken}`, 2);
  if (crcToken) {
    const hash = security.get_challenge_response(crcToken, twitterConfig.consumer_secret);
    res.status(200).send({ response_token: `sha256=${hash}` });
  } else {
    res.status(400).send('Error: crc_token missing from request.');
  }
});

/**
 * Returns index HTML page
 */
app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/index.html`);
});

const isSessionValid = (session) => {
  if (typeof session === 'undefined' || !session.timestamp) return false;

  const now = (new Date()).getTime();
  const time = (new Date(session.timestamp)).getTime();
  const delta = now - time;

  //* ** TEST ***//
  if (delta > 1000 * 60 * 30 || !session.isValid) { // 30mins
    // eslint-disable-next-line no-param-reassign
    session.isValid = false;
    return false;
  }

  return true;
};

app.get('/connect', (req, res) => {
  const continueTo = req.query.continueTo || '';
  const nextParams = req.query.nextParams || '';
  if (typeof req.session !== 'undefined' && isSessionValid(req.session)) {
    return res.redirect('/index');
  }
  ejs.renderFile(`${__dirname}/public/connect.ejs`, { continueTo, nextParams }, (err, str) => {
    if (err) __(err, 9);
    res.status(200).send(str);
  });
});

app.get('/index', (req, res) => {
  if (!isSessionValid(req.session)) { // 30mins
    req.session.destroy((err) => {
      if (err) return __(err, 9);
      res.redirect('/connect');
    });
  } else {
    ejs.renderFile(`${__dirname}/public/index.ejs`, { view: '', viewParams: '' }, (err, str) => {
      if (err) __(err, 9);
      res.status(200).send(str);
    });
  }
});

app.get('/view/:viewName/:viewParams*?', (req, res) => {
  const viewName = req.params.viewName || null;
  let viewParams = req.params.viewParams || '';

  if (isSessionValid(req.session) === false) {
    req.session.destroy((err) => {
      if (err) return __(err, 9);
      res.redirect(`/connect${viewName ? `?continueTo=${viewName}` : ''}${viewParams ? `&nextParams=${viewParams}` : ''}`);
    });
  } else {
    viewParams = Buffer.from(viewParams, 'base64').toString();
    console.log(viewParams);
    ejs.renderFile(`${__dirname}/public/index.ejs`, { view: viewName, viewParams }, (err, str) => {
      res.status(200).send(str);
    });
  }
});

app.post('/login', async (req, res) => {
  const username = req.body.username || '';
  const password = req.body.password || '';
  const session = new Session({ username, password });
  const status = await session.create();

  if (status === -1) {
    return res.status(403).send('-1');
  }
  req.session.timestamp = session.timestamp;
  req.session.token = session.id;
  req.session.isValid = true;

  return res.status(200).send('0');
});

/*
 * API
 * */

const getSchemaFromName = (name) => {
  const schemasMap = {
    rewards: schemas.LNQuizReward,
    // TODO: add other schemas
  };
  return (schemasMap[name] || null);
};

app.post('/api/db/:schema/get', async (req, res) => {
  if (!isSessionValid(req.session) && req.body.isTest !== true) {
    return res.status(403).send('-1');
  }

  const { schema } = req.params;
  const SchemaObj = getSchemaFromName(schema);

  if (!SchemaObj) return res.status(400).send('-1');

  const filter = req.body.filter || {};


  const queryResponse = await SchemaObj.find(filter);
  res.status(200).send(queryResponse);
});

app.post('/api/db/:schema/insert', async (req, res) => {
  if (!isSessionValid(req.session) && req.body.isTest === false) {
    return res.status(403).send('-1');
  }

  const { schema } = req.params;
  const entry = req.body.entry || null;

  const SchemaObj = getSchemaFromName(schema);

  if (!SchemaObj || !entry) return res.status(400).send('-1');

  const Entry = new SchemaObj(entry);
  Entry.save();

  res.status(200).send(Entry);
});

app.post('/api/db/:schema/update', async (req, res) => {
  if (!isSessionValid(req.session) && req.body.isTest === false) {
    return res.status(403).send('-1');
  }

  const { schema } = req.params;
  const query = req.body.entry || null;
  const filter = req.body.filter || {};

  const SchemaObj = getSchemaFromName(schema);

  if (!SchemaObj || !query) return res.status(400).send('-1');

  // TODO: TO BE CHANGED : The default DB is now Cryptodidacte
  const queryResponse = SchemaObj.update(filter, query);
  res.status(200).send(queryResponse);
});

// TODO
app.post('/db/removeAllById/', async (req, res) => {
  if (!isSessionValid(req.session) && req.body.isTest === false) {
    return res.status(403).send('-1');
  }

  const collection = req.body.collection || null;
  const idList = req.body.idList || null;
  if (!idList || !collection) return res.status(400).send('-1');

  const resp = await database.remove(collection, null, true, { idList });
  res.status(200).send(resp);
});

/**
 * Serve static files from directory public
 */
app.use(express.static('public'));

/**
 * Returns logs
 */
app.get('/logs', (req, res) => {
  res.sendFile(`${__dirname}/logs/main.log`);
});

// Starts server
https.createServer({
  key: fs.readFileSync('./certs/privkey.pem'),
  cert: fs.readFileSync('./certs/fullchain.pem'),
}, app)
  .listen(app.get('port'), () => {
    console.log('Node app is running on port', app.get('port'));
  });
