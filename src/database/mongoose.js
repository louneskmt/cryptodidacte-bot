const mongoose = require('mongoose');

const { databaseConfig } = require('../../config.js');

const uri = `mongodb://${databaseConfig.user}:${databaseConfig.password}@localhost:27017/cryptodidacte`;

const conn = mongoose.createConnection(uri);

const User = conn.model('User', require('./schemas/user.js'));
const TweetEvent = conn.model('TweetEvent', require('./schemas/tweetEvent.js'));
const Reward = conn.model('Reward', require('./schemas/reward.js'));

module.exports = {
  Database: conn,
  User,
  TweetEvent,
  Reward,
};
