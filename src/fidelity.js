const { __ } = require('./logger.js');
const {
  TweetEvent, User,
} = require('./database/mongoose.js');
const ethereum = require('./ethereum.js');
const Twitter = require('./Twitter.js');

const { ethereumConfig, fidelityConfig } = require('../config.js');

const status = {
  valid: 0,
  invalid: 1,
  noRewards: 2,
};

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
  if (fidelityConfig.eventTypes.includes(eventType)) return fidelityConfig.rewards[eventType];
  return 0;
};

const checkEvent = (eventData) => new Promise((resolve, reject) => {
  const { userId } = eventData;

  // Do not process events for old tweets (> 48h)
  const promiseTweetInfo = Twitter
    .getTweetInfo(eventData.targetTweetId)
    .then((tweetData) => {
      const createdDate = new Date(tweetData.created_at);
      if (Date.now() - createdDate.getTime() > 172800000) {
        __(`@${eventData.username} - Event '${eventData.eventType}': tweet ${eventData.targetTweetId} is too old. No rewards will be credited.`);
        resolve(status.noRewards);
      }
    });

  // Check that there's no duplicate
  const promiseSearch = TweetEvent
    .find({
      user: { _id: userId },
      eventType: eventData.eventType,
      targetTweetId: eventData.targetTweetId,
    })
    .then((result) => {
      if (result.length !== 0) {
        __(`@${eventData.username} - Event '${eventData.eventType}': already exists in database. No rewards will be credited.`);
        resolve(status.invalid);
      }
    });

  // Check the daily limit
  const promiseDailyLimit = User
    .findByUserId(eventData.userId)
    .then((user) => {
      if (!user) return;
      if (user.points.thisDay >= fidelityConfig.dailyLimit) {
        __(`@${eventData.username} - Event '${eventData.eventType}': daily limit reached. No rewards will be credited.`);
        resolve(status.noRewards);
      }
    });

  Promise
    .all([promiseTweetInfo, promiseSearch, promiseDailyLimit])
    .finally(() => {
      resolve(status.valid);
    });
});

const processEvent = async (eventData) => {
  const { userId } = eventData;

  const eventStatus = await checkEvent(eventData);

  if (eventStatus === status.invalid) return;

  let reward;
  if (eventStatus === status.noRewards) reward = 0;
  else reward = getReward(eventData.eventType);

  const Event = new TweetEvent({
    user: eventData.userId,
    eventType: eventData.eventType,
    tweetId: eventData.tweetId,
    targetTweetId: eventData.targetTweetId,
    timestamp: eventData.timestamp,
    reward,
  });

  Event.save();

  // Find User and create it if it doesn't exist
  const query = { _id: userId, username: eventData.username };
  const update = {
    $inc: {
      balance: reward,
      'points.allTime': reward,
      'points.thisDay': reward,
      'points.thisWeek': reward,
      'points.thisMonth': reward,
    },
  };
  const options = { upsert: true, new: true, setDefaultsOnInsert: true };

  User
    .findOneAndUpdate(query, update, options)
    .catch((err) => __(`Error while adding reward to balance of user ${userId}: ${err}`));
};

// Delete specified event and the associated reward from user balance
const deleteEvent = (eventToDelete) => {
  const query = { _id: eventToDelete.user._id };
  const minus = -1 * eventToDelete.reward;
  const update = {
    $inc: {
      balance: minus,
      'points.allTime': minus,
      'points.thisDay': minus,
      'points.thisWeek': minus,
      'points.thisMonth': minus,
    },
  };
  const options = { upsert: true, new: true, setDefaultsOnInsert: true };

  User
    .findOneAndUpdate(query, update, options)
    .catch((err) => __(`Error while removing reward to balance of user ${eventToDelete.user._id}: ${err}`));
  TweetEvent
    .deleteOne({ _id: eventToDelete._id })
    .catch((err) => __(`Error while deleting event ${eventToDelete._id} of user ${eventToDelete.user._id}: ${err}`));
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
  deleteEvent,
};
