const mongoose = require('mongoose');

const findByUserIdPlugin = require('./plugins/findByUserId.js');

const rewardSchema = new mongoose.Schema({
  userId: { type: String },
  username: { type: String },
  amount: { type: Number, min: 0 },
  added: { type: Date, default: () => Date.now() },
  claimed: { type: Boolean, default: false },
  claimDate: Date,
});

rewardSchema.methods.findSameUser = function findSameUser(cb) {
  return this.model('LNQuizReward').find({ userId: this.userId }, cb);
};

rewardSchema.statics.setClaimed = function setClaimed(userId) {
  return this.updateMany({ userId }, { claimed: true, claimDate: Date.now() });
};

rewardSchema.plugin(findByUserIdPlugin);

module.exports = rewardSchema;