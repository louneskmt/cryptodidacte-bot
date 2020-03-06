const Twit = require('twit');
const twitterApp = require('../config.js');
const T = new Twit(twitterApp);

module.exports = T;
