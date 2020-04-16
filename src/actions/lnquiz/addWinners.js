const Twitter = require('../../Twitter.js');
const lnquiz = require('../../lnquiz.js');
const { end, retry } = require('../global.js');
const { UserStatus } = require('../../database/mongoose.js');

const messageTemplates = require('../../../data/message_templates.json');
const insertVariablesInTemplate = require('../../helpers/insertVariablesInTemplate.js');

async function addWinners(params) {
  const { winners } = params;
  const { newEntries, errCode } = await lnquiz.addWinners(winners);

  if (errCode === 0) {
    for (const winner of newEntries) {
      // const clone = Object.assign(messageTemplates.lnquiz.notify, {});
      Twitter.sendMessage(winner.userId, insertVariablesInTemplate(messageTemplates.lnquiz.notify, { reward: winner.amount }));
    }
    end(params, insertVariablesInTemplate(messageTemplates.lnquiz.confirmAddition, {
      winner1: newEntries[0].username, winner2: newEntries[1].username, winner3: newEntries[2].username,
    }), { endMessage: false });
  } else {
    end(params, messageTemplates.global.error, { endMessage: false });
  }
}

async function tryAddWinners(params) {
  const { messageData } = params;

  if (messageData.entities.user_mentions.length === 3) {
    const newParams = {
      ...params,
      winners: messageData.entities.user_mentions,
    };
    addWinners(newParams);
  } else {
    retry(params, messageTemplates.lnquiz.retry);
  }
}

function waitForWinners(params) {
  const { userId } = params;
  Twitter.sendMessage(userId, messageTemplates.lnquiz.askForWinners);
  return UserStatus.set(userId, 'adding_winners');
}

module.exports = {
  addWinners,
  tryAddWinners,
  waitForWinners,
};
