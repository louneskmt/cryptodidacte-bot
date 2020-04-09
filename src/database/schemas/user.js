const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tweetEventSchema = require('./tweetEventSchema');

const userSchema = new Schema({
  user_id: String,
  username: String,
  balance: Number,
  events: [tweetEventSchema]
});

module.exports = tweetEventSchema;