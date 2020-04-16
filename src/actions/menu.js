const { __ } = require('../logger.js');
const Twitter = require('../Twitter.js');
const messageTemplates = require('../../data/message_templates.json');

module.exports = function sendMenu(params, type) {
  const { userId } = params;
  if (!messageTemplates.menu.keys().includes(type)) return;
  __(`Sending ${type} menu...`);
  Twitter.sendMessage(userId, messageTemplates.menu[type]);
};
