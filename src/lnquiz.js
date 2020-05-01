const fs = require('fs');
const rewards = require('../data/rewards.json');
const { __ } = require('./logger.js');
const {
  LNQuizReward,
} = require('./database/mongoose.js');


const countRewards = (userId, callback) => new Promise((resolve, reject) => {
  LNQuizReward
    .aggregate()
    .match({ userId, claimed: false })
    .group({ _id: null, total: { $sum: '$amount' } })
    .then((result) => {
      const total = result[0].total || 0;
      if (typeof callback === 'function') callback(total);
      resolve(total);
    })
    .catch((err) => {
      __(`Error counting rewards of ${userId} : ${err}`, 9);
      resolve(0);
    });
});

const addWinners = async (winners) => {
  const newEntries = [
    {
      userId: winners[0].id_str,
      username: winners[0].screen_name,
      amount: rewards.question,
    },
    {
      userId: winners[1].id_str,
      username: winners[1].screen_name,
      amount: rewards.writing,
    },
    {
      userId: winners[2].id_str,
      username: winners[2].screen_name,
      amount: rewards.random,
    },
  ];

  return new Promise((resolve, reject) => {
    LNQuizReward
      .create(newEntries)
      .then(() => resolve({ newEntries, errCode: 0 }))
      .catch(() => resolve({ newEntries, errCode: 1 }));
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
