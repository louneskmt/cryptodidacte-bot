const fs = require('fs')
const user = require('./user.js')
const lightning = require('./lightning.rest');
const database = require('./database.js');
const Twitter = require('./Twit.js');
var rewards = require('../data/rewards.json');
const {__} = require("./logger.js");

const countRewards = (user_id, callback) => {

  database.findDocuments("rewards", { user_id: user_id.toString() }, (result) => {
    if(result.length === 0) return;

    var totalToPay = 0;
    result.forEach((elmt) => {
      totalToPay += elmt.reward;
    })
    __("Here : "+amount,2)
    if(typeof callback === "function") callback(totalToPay);
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

  fs.writeFile(fileName, JSON.stringify(newRewards), (err) => {

    __(JSON.stringify(newRewards));
    __('lnquiz.js@updateRewards : Rewards updated at ' + fileName, 1);

    callback(err);
  });
}

module.exports = {
  countRewards,
  addWinners,
  updateRewards
}
