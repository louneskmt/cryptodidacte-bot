const mongoose = require('mongoose');

const { databaseConfig } = require('../../config.js');

const uri = `mongodb://${databaseConfig.user}:${databaseConfig.password}@localhost:27017/cryptodidacte`;

const connection = mongoose.createConnection(uri);

const User = connection.model('User', require('./schemas/user.js'));
const TweetEvent = connection.model('TweetEvent', require('./schemas/tweetEvent.js'));
const LNQuizReward = connection.model('LNQuizReward', require('./schemas/reward.js'));

module.exports = {
  Database: connection,
  User,
  TweetEvent,
  LNQuizReward,
};
