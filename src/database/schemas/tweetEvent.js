const mongoose = require('mongoose');

const { Schema } = mongoose;

const tweetEventSchema = new Schema({
  userId: String,
  username: String,
  eventType: String,
  tweetId: String,
  targetTweetId: String,
  timestamp: String,
});

tweetEventSchema.methods.findSameUser = function findSameUser(cb) {
  return this.model('TweetEvent').find({ userId: this.userId }, cb);
};

module.exports = tweetEventSchema;
