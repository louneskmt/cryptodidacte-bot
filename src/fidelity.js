const { __ } = require('./logger.js');
const {
  TweetEvent, User,
} = require('./database/mongoose.js');
const ethereum = require('./ethereum.js');
const Twitter = require('./Twit.js');

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

  const CurrentUser = await User.findByUserId(userId);
  if (!CurrentUser) {
    // Creates a new user if it doesn't exist
    const NewUser = new User({
      _id: userId,
      username: eventData.username,
      balance: getReward(eventData.eventType),
    });
    NewUser.save();
    return;
  }

  User
    .addToBalance(userId, getReward(eventData.eventType))
    .catch((err) => __(`Error while adding reward to balance of user ${userId}: ${err}`));
};

const claimTokens = (userId, amount) => {
  const CDT = new ethereum.ERC20(ethereumConfig.contractAddress, ethereumConfig.CryptodidacteTokenABI);

  User
    .findByUserId(userId)
    .then(async (user) => {
      if (!user.address) { __(`There is not any address linked to this account (@${user.username})`); }
      if (user.balance < amount) { __(`There are not enough funds in this account (@${user.username})`); }

      const tx = await CDT.send(user.address, amount);
      await tx.wait();
      __(`Payout user ID ${userId} - ${amount} CDT - Tx hash : ${tx.hash}`);
      user.balance -= amount;
      user.save();
    });
};

const linkETHAddress = async (userId, address) => {
  const CurrentUser = await User.findByUserId(userId);
  if (!CurrentUser) {
    const userInfo = await Twitter.getUserInfo({ userId });
    const NewUser = new User({
      _id: userId,
      username: userInfo.screen_name,
      address,
    });
    NewUser.save();
    return;
  }

  User
    .updateAddress(userId, address)
    .catch((err) => __(`Error while updating address of user ${userId}: ${err}`));
};

module.exports = {
  processEvent,
  linkETHAddress,
  claimTokens,
};
