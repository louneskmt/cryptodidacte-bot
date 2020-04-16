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

    setTimeout(() => resolve(), 600000);
    botEvents.once(eventName, (newParams) => {
      if (validator(newParams.message)) {
        UserStatus.del(userId);
        return resolve(newParams);
      }
      const replyMessage = messageTemplates.validators_errors[validator.name] || messageTemplates.global.reply;
      retry(newParams, replyMessage);
    });
  });
};

module.exports = {
  resolvePending,
  waitForPattern,
};
