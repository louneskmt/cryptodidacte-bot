const mongoose = require('mongoose');

const { Schema } = mongoose;

const tweetEventSchema = require('./tweetEvent.js');

const userSchema = new Schema({
  userId: String,
  username: String,
  balance: Number,
  events: [tweetEventSchema],
});

module.exports = userSchema;
