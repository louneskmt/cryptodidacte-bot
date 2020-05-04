const { __ } = require('../logger.js');
const Twitter = require('../Twitter.js');
const { UserStatus } = require('../database/mongoose.js');
const messageTemplates = require('../../data/message_templates');

async function end(params, { description, resetStatus = true, endMessage = true } = {}) {
  const { userId } = params;

  if (resetStatus) await UserStatus.del(userId);

  if (description && typeof description === 'string') Twitter.sendTextMessage(userId, description);
  else if (description && typeof description === 'object') Twitter.sendMessage(userId, description);

  if (endMessage) {
    setTimeout(() => {
      Twitter.sendMessage(userId, messageTemplates.global.end);
    }, 1000);
  }

  __(`End of action for ${userId}`);
}

function retry(params, description) {
  const { userId } = params;

  if (description && typeof description === 'string') Twitter.sendTextMessage(userId, description);
  else if (description && typeof description === 'object') Twitter.sendMessage(userId, description);
  else {
    Twitter.sendMessage(userId, messageTemplates.global.retry);
  }
}

module.exports = {
  end,
  retry,
};
