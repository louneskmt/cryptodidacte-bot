const fs = require('fs')

const lightning = require('./lightning.rest');
const database = require('./database.js');
const Twitter = require('./Twit.js');
var rewards = require('../data/rewards.json');

const claimRewards = (user_id) => {
  database.findDocuments("rewards", { user_id: user_id.toString() }, (result) => {
    var totalToPay = 0;

    if(result.length === 0) {
      Twitter.sendTextMessage(user_id, "You have nothing to claim.");
      return;
    }
    result.forEach((elmt) => {
      totalToPay += elmt.reward;
    })
    Twitter.sendTextMessage(user_id, "Please, send an invoice for " + totalToPay + " sats.");
  })
}



const addWinners = (winners, rewardsSpecific=rewards) => {
  var newEntries = [
    {
      user_id: winners[0].id_str,
      username: winners[0].screen_name,
      reward: defaultRewards.question,
    },
    {
      user_id: winners[1].id_str,
      username: winners[1].screen_name,
      reward: defaultRewards.writing,
    },
    {
      user_id: winners[2].id_str,
      username: winners[2].screen_name,
      reward: defaultRewards.random,
    },
  ]

  database.insertDocuments("rewards", newEntries, () => {});
}

const updateRewards = (newRewards) => {
  var fileName = __dirname + 'data/rewards.json'
  fs.writeFile(fileName, JSON.stringify(newRewards), function writeJSON(err) {
    if (err) return console.log(err);
    console.log(JSON.stringify(newRewards));
    console.log('writing to ' + fileName);
  }); 
}

module.exports = {
  claimRewards,
  addWinners,
}
