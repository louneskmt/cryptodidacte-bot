const mongoose = require('mongoose');
const { __ } = require('../../logger.js');

const userStatusSchema = new mongoose.Schema({
  userId: { type: String },
  status: { type: String, lowercase: true },
});

userStatusSchema.statics.findByUserId = function findByUserId(_id) {
  return this.findOne({ _id });
};

userStatusSchema.statics.set = function set(userId, status) {
  const update = { $set: { status } };
  const options = { upsert: true, new: true };

  return new Promise((resolve, reject) => {
    this
      .findOneAndUpdate({ userId }, update, options)
      .then((result) => {
        __(`Updated status of ${userId}`);
        resolve(result);
      })
      .catch((err) => {
        __(`Error updating status of ${userId} : ${err}`);
        reject(err);
      });
  });
};

userStatusSchema.statics.get = function get(userId) {
  return new Promise((resolve, reject) => {
    this
      .findOne({ userId })
      .then((result) => {
        if (!result) return resolve(undefined);
        __(`Found status for ${userId} : ${result.status}`);
        resolve(result.status);
      })
      .catch((err) => {
        __(`Error getting status of ${userId} : ${err}`);
        reject(err);
      });
  });
};

userStatusSchema.statics.del = function del(userId) {
  return new Promise((resolve, reject) => {
    this
      .findOneAndDelete({ userId })
      .then(() => {
        __(`Deleted status of ${userId}`);
        resolve();
      })
      .catch((err) => {
        __(`Error deleting status of ${userId} : ${err}`);
        reject(err);
      });
  });
};


module.exports = userStatusSchema;
