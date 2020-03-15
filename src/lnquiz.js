const lightning = require('./lightning.rest');
const database = require('./database.js');
const Twitter = require('./Twit.js')

const claimRewards = (user_id) => {
  database.findDocuments("rewards", { user_id: user_id }, (result) => {
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

const defaultRewards = {
  question: 150,
  writing: 300,
  random: 150,
}

const defaultWinners = {
  question: "",
  writing: "",
  random: "",
}

const addWinners = (winners, rewards=defaultRewards) => {
  var winners = defaultWinners;

  // db.findDocuments("rewards", { user_id: })

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


module.exports = {
  claimRewards,
  addWinners,
}
