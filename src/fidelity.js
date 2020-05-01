const { __ } = require('./logger.js');
const {
  TweetEvent, User,
} = require('./database/mongoose.js');
const ethereum = require('./ethereum.js');

const { ethereumConfig } = require('../config.js');

const events = require('../data/events.json');

/*
eventData Object sample:
{
    userId,
    username,
    tweetId,
    eventType: 'retweet',
    targetTweetId,
    timestamp
}
*/

const getReward = (eventType) => {
  if (events.eventTypes.includes(eventType)) return events.rewards[eventType];
  return 0;
};

const processEvent = async (eventData) => {
  const { userId } = eventData;

  // Check that there's no duplicate
  const research = await TweetEvent.find({
    user: { _id: userId },
    eventType: eventData.eventType,
    targetTweetId: eventData.targetTweetId,
  });
  if (research.length !== 0) return;

  const Event = new TweetEvent({
    user: eventData.userId,
    eventType: eventData.eventType,
    tweetId: eventData.tweetId,
    targetTweetId: eventData.targetTweetId,
    date: eventData.timestamp,
  });

  Event.save();

  // Find User and create it if it doesn't exist
  const reward = getReward(eventData.eventType);
  const query = { _id: userId, username: eventData.username };
  const update = { $inc: { balance: reward, points: reward } };
  const options = { upsert: true, new: true, setDefaultsOnInsert: true };

  User
    .findOneAndUpdate(query, update, options)
    .catch((err) => __(`Error while adding reward to balance of user ${userId}: ${err}`));
};

const claimTokens = (userId, amount, address) => {
  const CDT = new ethereum.ERC20(ethereumConfig.contractAddress, ethereumConfig.cryptodidacteTokenABI);

  return new Promise((resolve, reject) => {
    User
      .findByUserId(userId)
      .then(async (user) => {
        const toAddress = address || user.address;
        if (!toAddress) { __(`There is not any address linked to this account (@${user.username})`); }
        if (user.balance < amount) {
          __(`There are not enough funds in this account (@${user.username})`);
          return reject(new Error(`There are not enough funds in this wallet (currently ${user.balance} CDT).`));
        }

        const tx = await CDT.send(toAddress, amount);
        resolve(tx.hash);
        __(`Payout user ID ${userId} - ${amount} CDT - Tx hash : ${tx.hash}`);
        await tx.wait();
        user.balance -= amount;
        user.save();
      });
  });
};

const getLinkedAddress = (userId) => new Promise((resolve, reject) => {
  User
    .findByUserId(userId)
    .then((result) => {
      const { address } = result;
      if (address && address !== '') resolve(address);
      else resolve();
    })
    .catch((err) => __(`Error fetching linked address of user ${userId}: ${err}`));
});

const getBalance = (userId) => new Promise((resolve, reject) => {
  User
    .findByUserId(userId)
    .then((result) => {
      resolve(result.balance);
    })
    .catch((err) => __(`Error fetching balance of user ${userId}: ${err}`));
});

const sendTokens = (from, to, amount) => new Promise((resolve, reject) => {
  const fromId = from.id_str;
  const toId = to.id_str;

  User
    .findByUserId(fromId)
    .then((userFrom) => {
      if (userFrom.balance < amount || !userFrom) {
        __(`There are not enough funds in this account (@${userFrom.username})`);
        return reject(new Error(`There are not enough funds in your wallet (currently ${userFrom.balance} CDT).`));
      }

      const query = { _id: toId, username: to.screen_name };
      const update = { $inc: { balance: amount } };
      const options = { upsert: true, new: true, setDefaultsOnInsert: true };

      User
        .findOneAndUpdate(query, update, options)
        .then(() => {
          userFrom.balance -= amount;
          userFrom.save();
          resolve(userFrom.balance);
        })
        .catch((err) => {
          __(`Error (#2) while sending ${amount} CDT from ${fromId} to ${toId}: ${err}`, 9);
          return reject(new Error(`Unknow error while sending ${amount} CDT to @${to.screen_name}. Please try again later and contact @lounes_kmt if the issue persists.`));
        });
    })
    .catch((err) => {
      __(`Error (#1) while sending ${amount} CDT from ${fromId} to ${toId}: ${err}`, 9);
      return reject(new Error(`Unknow error while sending ${amount} CDT to @${to.screen_name}. Please try again later and contact @lounes_kmt if the issue persists.`));
    });
});

module.exports = {
  processEvent,
  claimTokens,
  getLinkedAddress,
  getBalance,
  sendTokens,
};
