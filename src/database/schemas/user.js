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
  points: {
    type: Number,
    get: (v) => Math.round(v),
    set: (v) => Math.round(v),
    default: 0,
  },
  pointsToday: {
    type: Number,
    get: (v) => Math.round(v),
    set: (v) => Math.round(v),
    default: 0,
  },
  address: { type: String },
  events: [{ type: mongoose.Schema.Types.ObjectId, ref: 'TweetEvent' }],
});

userSchema.statics.findByUserId = function findByUserId(_id) {
  return this.findOne({ _id });
};

userSchema.statics.addToBalance = function addToBalance(_id, amount) {
  return new Promise((resolve, reject) => {
    this
      .updateOne({ _id }, { $inc: { balance: amount } })
      .then(() => resolve())
      .catch((err) => reject(err));
  });
};

userSchema.statics.updateAddress = function updateAddress(_id, address) {
  return new Promise((resolve, reject) => {
    this
      .updateOne({ _id }, { $set: { address } })
      .then(() => resolve())
      .catch((err) => reject(err));
  });
};

userSchema.statics.resetLimit = function resetLimit() {
  return new Promise((resolve, reject) => {
    this
      .updateMany({}, { $set: { pointsToday: 0 } })
      .then(() => resolve())
      .catch((err) => reject(err));
  });
};

userSchema.methods.populateEvents = function populateEvents() {
  return new Promise((resolve, reject) => {
    this
      .populate({ path: 'events', select: '-user -__v' })
      .execPopulate()
      .then((user) => resolve(user))
      .catch((err) => reject(err));
  });
};

userSchema.virtual('userId').get(function () { return this._id; });

module.exports = userSchema;
