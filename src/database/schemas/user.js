const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  username: { type: String },
  balance: {
    type: Number,
    get: (v) => Math.round(v),
    set: (v) => Math.round(v),
    default: 0,
  },
  events: [{ type: mongoose.Schema.Types.ObjectId, ref: 'TweetEvent' }],
});

userSchema.statics.findByUserId = function findByUserId(userId) {
  return this.find({ userId });
};

userSchema.statics.updateHistory = function updateHistory(userId) {
  return this.find({ userId }).populate({
    path: 'events',
    match: { userId },
  }).exec();
};

module.exports = userSchema;
