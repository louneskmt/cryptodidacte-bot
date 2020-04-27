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
  const query = { _id: userId, username: eventData.username };
  const update = { $inc: { balance: getReward(eventData.eventType) } };
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
          return reject(new Error('There are not enough funds in this wallet.'));
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

module.exports = {
  processEvent,
  claimTokens,
  getLinkedAddress,
};
