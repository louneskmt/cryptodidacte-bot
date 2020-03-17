const fs = require('fs')
const user = require('./user.js')
const lightning = require('./lightning.rest');
const database = require('./database.js');
const Twitter = require('./Twit.js');
var rewards = require('../data/rewards.json');

const claimRewards = (user_id) => {
  database.findDocuments("rewards", { user_id: user_id.toString() }, (result) => {
    if(result.length === 0) {
      Twitter.sendTextMessage(user_id, "You have nothing to claim.");
      return;
    }

    var totalToPay = 0;
    result.forEach((elmt) => {
      totalToPay += elmt.reward;
    })
    Twitter.sendTextMessage(user_id, "Please, send an invoice for " + totalToPay + " sats.");
    user.setStatus(user_id, "claim_rewards_" + totalToPay.toString() + "_sats");
  });
}

const addWinners = (winners) => {
  var newEntries = [
    {
      user_id: winners[0].id_str,
      username: winners[0].screen_name,
      reward: rewards.question,
    },
    {
      user_id: winners[1].id_str,
      username: winners[1].screen_name,
      reward: rewards.writing,
    },
    {
      user_id: winners[2].id_str,
      username: winners[2].screen_name,
      reward: rewards.random,
    },
  ]

  database.insertDocuments("rewards", newEntries, () => {});
}

const updateRewards = (newRewards, callback) => {
  var fileName = __dirname + '/../data/rewards.json'
  fs.writeFile(fileName, JSON.stringify(newRewards), function writeJSON(err) {
    console.log(JSON.stringify(newRewards));
    console.log('writing to ' + fileName);
    rewards = newRewards;
    if(typeof callback === "function") return callback(err);
  });
}

module.exports = {
  claimRewards,
  addWinners,
  updateRewards
}
