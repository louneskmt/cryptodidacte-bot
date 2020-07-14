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
const Twitter = require('./src/Twitter.js');

require('./src/plannedTasks.js');

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
 * Serve static files from directory public
 */
app.use(express.static('public'));

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

/**
 * Returns logs
 */
/*
app.get('/logs', (req, res) => {
  res.sendFile(`${__dirname}/logs/main.log`);
});
*/

app.get('/', (req, res) => {
  res.redirect('/connect');
});

app.get('/done', (req, res) => {
  console.log(req.query);
  console.log(req.body);
});

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

app.get('/stats', (req, res) => {
  if (!isSessionValid(req.session)) { // 30mins
    req.session.destroy((err) => {
      if (err) return __(err, 9);
      res.redirect('/connect?continueTo=stats');
    });
  } else {
    res.status(200).sendFile(`${__dirname}/public/stats.html`);
  }
});

app.get('/view/:viewName/:viewParams*?', (req, res) => {
  const viewName = req.params.viewName || null;
  let viewParams = req.params.viewParams || '';

  if (!isSessionValid(req.session)) {
    req.session.destroy((err) => {
      if (err) return __(err, 9);
      res.redirect(`/connect${viewName ? `?continueTo=${viewName}` : ''}${viewParams ? `&nextParams=${viewParams}` : ''}`);
    });
  } else {
    viewParams = Buffer.from(viewParams, 'base64').toString();

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
    users: schemas.User,
    tweetevents: schemas.TweetEvent,
  };
  return (schemasMap[name] || null);
};

app.use((req, res, next) => {
  if (!isSessionValid(req.session)) {
    return res.status(403).send('-1');
  }
  next();
});

app.post('/api/db/:schema/get', async (req, res) => {
  const { schema } = req.params;
  const SchemaObj = getSchemaFromName(schema);

  if (!SchemaObj) return res.status(400).send('-1');

  const filter = req.body.filter || {};
  const schemaDescription = (typeof SchemaObj.loadUIDescription === 'function') ? SchemaObj.loadUIDescription : undefined;
  const queryResponse = await SchemaObj.find(filter);

  const toSend = {
    schemaDescription,
    queryResponse,
  };
  res.status(200).send(toSend);
});

app.post('/api/db/:schema/insert', async (req, res) => {
  const { schema } = req.params;
  const entry = req.body.entry || null;
  __(entry, 2);


  const SchemaObj = getSchemaFromName(schema);

  if (!SchemaObj || !entry) return res.status(400).send('-1');

  const entries = [];

  for (const element of entry) {
    const Entry = new SchemaObj(element);
    // eslint-disable-next-line no-await-in-loop
    const saved = await Entry.save();
    entries.push(saved);
  }
  res.status(200).send(entries);
});

app.post('/api/db/:schema/update', async (req, res) => {
  const { schema } = req.params;
  const query = req.body.query || null;
  const filter = req.body.filter || {};

  const SchemaObj = getSchemaFromName(schema);

  if (!SchemaObj || !query) return res.status(400).send('-1');

  const queryResponse = await SchemaObj.updateOne(filter, query);
  res.status(200).send(queryResponse.nModified.toString()); // SHOULD SEND ONE
});

// TODO
app.post('/api/db/:schema/remove/idList', async (req, res) => {
  const { schema } = req.params;
  const idList = req.body.idList || null;

  const SchemaObj = getSchemaFromName(schema);

  if (!idList || !SchemaObj) return res.status(400).send('-1');

  const resp = await SchemaObj.deleteMany({ _id: { $in: idList } });
  res.status(200).send(resp);
});

/**
 * API TWITTER
 */
app.post('/api/twitter/users/show', async (req, res) => {
  const { userId = undefined, username = undefined } = req.body;

  if (!userId && !username) return res.status(400);

  Twitter
    .getUserInfo({ userId, username })
    .then((result) => {
      res.status(200).send(result);
    })
    .catch((err) => {
      res.status(502).send(err);
    });
});

app.post('/api/twitter/tweets/show', async (req, res) => {
  const { tweetId } = req.body;

  Twitter
    .getTweetInfo(tweetId)
    .then((result) => {
      res.status(200).send(result);
    })
    .catch((err) => {
      res.status(502).send(err);
    });
});

app.post('/api/twitter/tweets/lookup', async (req, res) => {
  const { idsArray } = req.body;

  Twitter
    .getManyTweetsInfo(idsArray)
    .then((result) => {
      res.status(200).send(result);
    })
    .catch((err) => {
      res.status(502).send(err);
    });
});

app.post('/api/twitter/tweets/retweeters', async (req, res) => {
  const { tweetId } = req.body;

  Twitter
    .getRetweeters(tweetId)
    .then((result) => {
      res.status(200).send(result);
    })
    .catch((err) => {
      res.status(502).send(err);
    });
});

// Starts server
https.createServer({
  key: fs.readFileSync('./certs/privkey.pem'),
  cert: fs.readFileSync('./certs/fullchain.pem'),
}, app)
  .listen(app.get('port'), () => {
    __(`Node app is running on port ${app.get('port')}`);
  });
