const Twitter = require('../../Twitter.js');
const { __ } = require('../../logger.js');
const { end } = require('../global.js');
const { getBalance } = require('../../fidelity.js');

const messageTemplates = require('../../../data/message_templates.json');
const insertVariablesInTemplate = require('../../helpers/insertVariablesInTemplate.js');


async function getBalanceCommand(params, args) {
  const { userId } = params;

  getBalance(userId)
    .then((balance) => {
      if (balance && balance !== 0) Twitter.sendMessage(userId, insertVariablesInTemplate(messageTemplates.fidelity.getBalance, { balance }));
      else Twitter.sendMessage(userId, messageTemplates.fidelity.getBalanceEmpty);
      end(params);
    })
    .catch((err) => {
      __(`Error while fetching balance of user ${userId} : ${err}`, 9);
      end(params, 'Unknow error while fetching balance. Please try again later and contact @lounes_kmt if the issue persists.');
    });
}

module.exports = getBalanceCommand;
