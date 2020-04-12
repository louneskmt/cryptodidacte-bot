const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  _id: {
    type: String,
    alias: 'userId',
  },
  username: { type: String },
  balance: {
    type: Number,
    get: (v) => Math.round(v),
    set: (v) => Math.round(v),
    default: 0,
  },
  events: [{ type: mongoose.Schema.Types.ObjectId, ref: 'TweetEvent' }],
}, { collection: 'users-test' });

userSchema.statics.findByUserId = function findByUserId(userId) {
  return this.findOne({ userId });
};

// userSchema.plugin(require('mongoose-autopopulate'));

module.exports = userSchema;
