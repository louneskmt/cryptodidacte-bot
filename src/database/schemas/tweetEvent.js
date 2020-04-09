const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tweetEventSchema = new Schema({
  user_id:    String,
  username:   String,
  event_type: String,
  tweet_id:   String,
  target_tweet_id: String,
  timestamp:  String
});

tweetEventSchema.methods.findSameUser = function(cb) {
  return this.model('TweetEvent').find({ user_id: this.user_id }, cb);
}

module.exports = tweetEventSchema;