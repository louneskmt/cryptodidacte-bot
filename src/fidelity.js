const { __ } = require('./logger.js');
const Database = require('./database.js');
const ethereum = require('./ethereum.js');

const { websiteDbConfig, ethereumConfig } = require('../config.js');

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
const processEvent = async (eventData) => {
  // Connect to DB
  const db = new Database('fidelity', `mongodb://${websiteDbConfig.user}:${websiteDbConfig.password}@localhost:27017/fidelity`);
  await db.connect();

  const research = await db.find('history', {
    userId: eventData.userId,
    eventType: eventData.eventType,
    targetTweetId: eventData.targetTweetId,
  });
  if (research.length !== 0) return;
  await db.insert('history', eventData);

  let reward;
  switch (eventData.eventType) {
    case 'favorite':
      reward = 2;
      break;
    case 'retweet':
      reward = 5;
      break;
    case 'quote':
      reward = 6;
      break;
    case 'reply':
      reward = 3;
      break;
    default:
      reward = 0;
      break;
  }

  db.find('users', { userId: eventData.userId }).then(async (docs) => {
    if (docs.length === 0) {
      await db.insert('users', {
        userId: eventData.userId,
        username: eventData.username,
        balance: reward,
      });
    } else {
      await db.update('users', {
        filter: { userId: eventData.userId },
        edit: { balance: reward },
        mode: 'inc',
      });
    }
    await db.disconnect();
  });
};

const payout = (userId) => {
  const db = new Database('fidelity', `mongodb://${websiteDbConfig.user}:${websiteDbConfig.password}@localhost:27017/fidelity`);
  const CDT = new ethereum.ERC20(ethereumConfig.contractAddress, ethereumConfig.CryptodidacteTokenABI);

  db.find('users', { userId }).then((docs) => {
    if (!docs[0].address) {
      __(`There is not any address linked to this account (@${docs[0].user_name})`);
      return;
    }
    if (docs[0].balance === 0) {
      __(`There is not enough funds in this account (@${docs[0].user_name})`);
      return;
    }

    CDT.send(docs[0].address, docs[0].balance).then(async (tx) => {
      __(`Payout user ID ${docs[0].user_id} - ${docs[0].balance} CDT - Tx hash : ${tx.hash}`);
      await tx.wait();
      __('Done!');
    });

    db.disconnect();
  });
};

const linkETHAddress = async (userId, address) => {
  const db = new Database('fidelity', `mongodb://${websiteDbConfig.user}:${websiteDbConfig.password}@localhost:27017/fidelity`);

  await db.update('users', {
    filter: { userId },
    edit: { address },
    mode: 'set',
  });

  await db.disconnect();
};

module.exports = {
  processEvent,
};
