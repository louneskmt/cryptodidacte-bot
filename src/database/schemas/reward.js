const mongoose = require('mongoose');

const { Schema } = mongoose;

const rewardSchema = new Schema({
  userId: String,
  username: String,
  amount: Number,
  claimed: Boolean,
  claimDate: Date,
});

rewardSchema.methods.findSameUser = function findSameUser(cb) {
  return this.model('Reward').find({ userId: this.userId }, cb);
};

rewardSchema.methods.setClaimed = function setClaimed() {
  this.model('Reward').find({ userId: this.userId }, cb);
};

module.exports = rewardSchema;
