const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const rewardSchema = new Schema({
    user_id: String,
    username: String,
    amount: Number,
    claimed: Boolean,
    claimDate: Date
});

rewardSchema.methods.findSameUser = function(cb) {
    return this.model('Reward').find({ user_id: this.user_id }, cb);
}

rewardSchema.methods.setClaim = function() {
    this.model('Reward').find({ user_id: this.user_id }, cb)
}

module.exports = rewardSchema;