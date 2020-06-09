const Twitter = require('../../Twitter.js');
const { waitForMessage } = require('../../helpers/pending.js');
const { end } = require('../global.js');
const messageTemplates = require('../../../data/message_templates.json');

async function withdrawCDT(params) {
  const { userId } = params;
  
  end(params);
}

module.exports = withdrawCDT;
