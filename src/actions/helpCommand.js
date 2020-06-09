const Twitter = require('../Twitter.js');

const messageTemplates = require('../../data/message_templates.json');

async function helpCommand(params, args) {
  const { userId } = params;

  if (args[0] === 'full') await Twitter.sendMessage(userId, messageTemplates.global.intro);
  await Twitter.sendMessage(userId, messageTemplates.global.helpCommands);
}

module.exports = helpCommand;
