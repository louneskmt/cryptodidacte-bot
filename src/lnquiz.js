const lightning = require('./lightning.rest');

const claimRewards = () => {

}

const defaultRewards = {
  question: 15000,
  writing: 30000,
  random: 15000,
}

const addWinners = (winners, rewards=defaultRewards) => {
  var winners = {"winner1": 15000, "winner2": 30000, "winner3": 8000};

  var lnquiz = {
    id: 103,
    id_str: "103",
    date: "2020-04-17",
    winners: {
      question: winners.question,
      writing: winners.writing,
      random: winners.random,
    },
    rewards: rewards
  }
}


module.exports = {
  claimRewards,
  addWinner,
}
