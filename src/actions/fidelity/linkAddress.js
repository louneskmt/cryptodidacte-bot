const Twitter = require('../../Twitter.js');
const { waitForMessage } = require('../../helpers/pending.js');
const { end } = require('../global.js');

const messageTemplates = require('../../../data/message_templates.json');

async function linkAddress(params) {
  const { userId } = params;
  Twitter.sendMessage(userId, messageTemplates.fidelity.link);
  const response = await waitForMessage(userId);
  Twitter.sendTextMessage(userId, response.message);
  end(params);
}

module.exports = linkAddress;
