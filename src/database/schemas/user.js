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
      .then((err) => {
        if (err) reject(err);
        resolve();
      });
  });
};

userSchema.statics.updateAddress = function updateAddress(_id, address) {
  return new Promise((resolve, reject) => {
    this
      .updateOne({ _id }, { $set: { address } })
      .then((err) => {
        if (err) reject(err);
        resolve();
      });
  });
};

userSchema.methods.populateEvents = function populateEvents() {
  return new Promise((resolve, reject) => {
    this
      .populate({ path: 'events', select: '-user -__v' })
      .execPopulate((err, user) => {
        if (err) throw err;
        resolve(user);
      });
  });
};

userSchema.virtual('userId').get(function () { return this._id; });

module.exports = userSchema;
