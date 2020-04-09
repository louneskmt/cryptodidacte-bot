const mongoose = require('mongoose');
const Schema = mongoose.Schema;

class Mongoose {
    constructor(uri) {
        this.conn = mongoose.createConnection(uri);

        conn.model('User', require('./schemas/user.js'));
        conn.model('TweetEvent', require('./schemas/tweetEvent.js'));
        conn.model('Reward', require('./schemas/reward.js'));
    }
}

module.exports = Mongoose;


