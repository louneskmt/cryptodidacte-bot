const Twitter = require('../../Twitter.js');
const { waitForPattern } = require('../../helpers/pending.js');
const { end } = require('../global.js');

const messageTemplates = require('../../../data/message_templates.json');
const validators = require('../../helpers/validators.js');

async function linkAddress(params) {
  const { userId } = params;
  Twitter.sendMessage(userId, messageTemplates.fidelity.link);
  const response = await waitForPattern(userId, { validator: validators.isEthereumAddress });
  if (!response) return end(params, 'Timeout, please try again');

  Twitter.sendTextMessage(userId, response.message);
  end(params);
}

module.exports = linkAddress;
