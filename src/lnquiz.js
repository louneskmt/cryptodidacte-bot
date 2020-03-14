const lightning = require('./lightning.rest');
const db = require('./database');

const claimRewards = () => {

}

const defaultRewards = {
  question: 15000,
  writing: 30000,
  random: 15000,
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
      balance: defaultRewards.question,
    },
    {
      user_id: winners[1].id_str,
      username: winners[1].screen_name,
      balance: defaultRewards.writing,
    },
    {
      user_id: winners[2].id_str,
      username: winners[2].screen_name,
      balance: defaultRewards.random,
    },
  ]

  db.insertDocuments("rewards", newEntries, () => {});
}


module.exports = {
  claimRewards,
  addWinners,
}
