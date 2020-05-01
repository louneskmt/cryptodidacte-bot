const { __ } = require('../logger.js');
const Twitter = require('../Twitter.js');
const messageTemplates = require('../../data/message_templates.json');

const DEFAULT = 'standard';

module.exports = function sendMenu(params, args) {
  const { userId } = params;
  const type = args[0] || DEFAULT;
  if (!Object.prototype.hasOwnProperty.call(messageTemplates.menu, type)) return Twitter.sendMessage(userId, messageTemplates.menu[DEFAULT]);
  __(`Sending ${type} menu...`);
  Twitter.sendMessage(userId, messageTemplates.menu[type]);
};
