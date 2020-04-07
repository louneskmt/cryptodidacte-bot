const fs = require('fs');
const lightning = require('./lightning.rest');
const Twitter = require('./Twit.js');
var rewards = require('../data/rewards.json');
const {__} = require("./logger.js");

const countRewards = (user_id, callback) => {

  database.find("rewards", { user_id: user_id.toString() }).then((result) => {
    
    var totalToPay = 0;
    result.forEach((elmt) => {
      totalToPay += elmt.reward;
    })

    if(typeof callback === "function") callback(totalToPay);
  });

}

const addWinners = async (winners) => {
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

  return new Promise(function(resolve, reject){
    database.insert("rewards", newEntries).then(res => resolve(0)).catch(err => resolve(1));
  })
}

const updateRewards = (newRewards, callback) => {
  var fileName = __dirname + '/../data/rewards.json'

  fs.writeFile(fileName, JSON.stringify(newRewards), (err) => {

    __(JSON.stringify(newRewards));
    __('lnquiz.js@updateRewards : Rewards updated at ' + fileName, 1);
    
    rewards.question = newRewards.question
    rewards.writing = newRewards.writing
    rewards.random = newRewards.random
    
    callback(err);
  });
}

module.exports = {
  countRewards,
  addWinners,
  updateRewards,
  rewards
}
