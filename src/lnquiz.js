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

  // var newEntries = [
  //   {
  //     user_id: winners.question.id,
  //     username: winners.question.username,
  //     balance: ,
  //   },
  //   {
  //     user_id: ,
  //     username: winners.question,
  //     balance: ,
  //   },
  //   {
  //     user_id: "1234",
  //     username: winners.question,
  //     balance: ,
  //   }
  // ]
}


module.exports = {
  claimRewards,
  addWinners,
}
