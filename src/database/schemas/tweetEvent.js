const mongoose = require('mongoose');

const tweetEventSchema = new mongoose.Schema({
  user: {
    type: String, ref: 'User', autopopulate: true, alias: 'userId',
  },
  eventType: {
    type: String,
    lowercase: true,
    enum: ['retweet', 'quote', 'reply', 'favorite'],
  },
  tweetId: { type: String },
  targetTweetId: { type: String },
  timestamp: { type: String },
  reward: {
    type: Number,
    get: (v) => Math.round(v),
    set: (v) => Math.round(v),
    default: 0,
  },
});

tweetEventSchema.plugin(require('mongoose-autopopulate'));

tweetEventSchema.methods.findSameUser = function findSameUser(cb) {
  return this.model('TweetEvent').find({ user: this.user }, cb);
};

tweetEventSchema.statics.findByUserId = function findByUserId(userId) {
  return this.find({ user: userId });
};

tweetEventSchema.statics.findByType = function findByType(eventType) {
  return this.find({ eventType });
};

tweetEventSchema.statics.findByTarget = function findByTarget(targetTweetId) {
  return this.find({ targetTweetId });
};

tweetEventSchema.statics.findByDateRange = function findByDateRange(from, to) {
  if ((from && Object.prototype.toString.call(from) !== '[object Date]')
  || (to && Object.prototype.toString.call(to) !== '[object Date]')) {
    throw new Error('Arguments must be of type Date');
  }
  const min = from.getTime();
  const max = to.getTime();
  return this.find({ timestamp: { $gt: min, $lt: max } });
};

module.exports = tweetEventSchema;
