const botEvents = require('../events/botEvents.js');
const { UserStatus } = require('../database/mongoose.js');
const { retry } = require('../actions/global.js');

const messageTemplates = require('../../data/message_templates.json');

const resolvePending = (params) => {
  const { userId } = params;
  const eventName = `pending-${userId}`;
  botEvents.emit(eventName, params);
};

const waitForPattern = async (userId, { validator = () => true } = {}) => {
  UserStatus.set(userId, 'pending');
  return new Promise((resolve, reject) => {
    const eventName = `pending-${userId}`;
    botEvents.removeAllListeners(eventName);

    let timeout = setTimeout(() => resolve(), 600000);
    botEvents.on(eventName, (newParams) => {
      if (validator(newParams.message)) {
        UserStatus.del(userId);
        botEvents.removeAllListeners(eventName);
        return resolve(newParams);
      }
      const replyMessage = messageTemplates.validators_errors[validator.name] || messageTemplates.global.reply;
      retry(newParams, replyMessage);

      clearTimeout(timeout);
      timeout = setTimeout(() => resolve(), 600000);
    });
  });
};

module.exports = {
  resolvePending,
  waitForPattern,
};
