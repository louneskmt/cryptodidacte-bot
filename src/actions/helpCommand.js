const Twitter = require('../Twitter.js');

const messageTemplates = require('../../data/message_templates.json');

async function helpCommand(params) {
  const { userId } = params;

  await Twitter.sendMessage(userId, messageTemplates.global.intro);
  await Twitter.sendMessage(userId, messageTemplates.global.helpCommands);
}

module.exports = helpCommand;
