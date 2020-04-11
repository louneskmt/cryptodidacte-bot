const fs = require('fs');
const rewards = require('../data/rewards.json');
const { __ } = require('./logger.js');
const Database = require('./database.js');

const db = new Database('cryptodidacte');

const countRewards = (userId, callback) => {
  db.find('rewards', { user_id: userId.toString() }).then((result) => {
    let totalToPay = 0;
    result.forEach((elmt) => {
      totalToPay += elmt.reward;
    });

    if (typeof callback === 'function') callback(totalToPay);
  });
};

const addWinners = async (winners) => {
  const newEntries = [
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
  ];

  return new Promise((resolve, reject) => {
    db.insert('rewards', newEntries).then(() => resolve({ newEntries, errCode: 0 })).catch(() => resolve({ newEntries, errCode: 1 }));
  });
};

const updateRewards = (newRewards, callback) => {
  const fileName = `${__dirname}/../data/rewards.json`;

  fs.writeFile(fileName, JSON.stringify(newRewards), (err) => {
    __(JSON.stringify(newRewards));
    __(`lnquiz.js@updateRewards : Rewards updated at ${fileName}`, 1);

    rewards.question = newRewards.question;
    rewards.writing = newRewards.writing;
    rewards.random = newRewards.random;

    callback(err);
  });
};

module.exports = {
  countRewards,
  addWinners,
  updateRewards,
  rewards,
};
