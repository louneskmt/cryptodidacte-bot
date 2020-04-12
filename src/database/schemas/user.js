const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  _id: { type: String },
  username: { type: String },
  balance: {
    type: Number,
    get: (v) => Math.round(v),
    set: (v) => Math.round(v),
    default: 0,
  },
  events: [{ type: mongoose.Schema.Types.ObjectId, ref: 'TweetEvent' }],
});

userSchema.statics.findByUserId = function findByUserId(_id) {
  return this.findOne({ _id });
};

userSchema.virtual('userId').get(function () { return this._id; });
userSchema.plugin(require('mongoose-autopopulate'));

module.exports = userSchema;
