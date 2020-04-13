const mongoose = require('mongoose');
const Twit = require('../../Twit.js'); // To fetch user info

const findByUserIdPlugin = require('./plugins/findByUserId.js');

/* *** *** *** *** *** */
/* ***    SCHEMA   *** */
/* *** *** *** *** *** */
const rewardSchema = new mongoose.Schema({
  userId: { type: String }, // Fetched automatically if not specified
  username: { type: String },
  amount: { type: Number, min: 0 },
  added: { type: Date, default: () => Date.now() },
  claimed: { type: Boolean, default: false },
  claimDate: { type: Date },
});

/* *** *** *** *** *** */
/* *** MIDDLEWARES *** */
/* *** *** *** *** *** */
rewardSchema.pre('save', async function () {
  // Fetches the Twitter usedId before saving IF not specified
  if (!this.userId) {
    const userInfo = await Twit.getUserInfo({ username: this.username });
    this.userId = userInfo.id_str;
  }
});

/* *** *** *** *** *** */
/* ***   METHODS   *** */
/* *** *** *** *** *** */
rewardSchema.methods.findSameUser = function findSameUser(cb) {
  return this.model('LNQuizReward').find({ userId: this.userId }, cb);
};

// MANDATORY METHOD
rewardSchema.statics.getSchemaDescription = function () {
  return [
    {
      title: 'Username',
      field: 'username',
      type: 'string',
    },
    {
      title: 'Added',
      field: 'added',
      type: 'date',
    },
    {
      title: 'Claimed',
      field: 'claimed',
      type: 'boolean',
      values: {
        true: 'Yes',
        false: 'No',
      },
    },
    {
      title: 'Amount',
      field: 'amount',
      type: 'number',
    },
  ];
};
rewardSchema.statics.setClaimed = function setClaimed(userId) {
  return this.updateMany({ userId }, { claimed: true, claimDate: Date.now() });
};


rewardSchema.plugin(findByUserIdPlugin);

module.exports = rewardSchema;
