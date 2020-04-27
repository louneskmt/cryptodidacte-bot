const { __ } = require('../logger.js');
const Twitter = require('../Twitter.js');
const messageTemplates = require('../../data/message_templates.json');

module.exports = function sendMenu(params, args) {
  const { userId } = params;
  const type = args[0] || 'standard';
  if (!Object.prototype.hasOwnProperty.call(messageTemplates.menu, type)) return Twitter.sendMessage(userId, messageTemplates.menu.standard);
  __(`Sending ${type} menu...`);
  Twitter.sendMessage(userId, messageTemplates.menu[type]);
};
