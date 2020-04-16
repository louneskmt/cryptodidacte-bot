const botEvents = require('../events/botEvents.js');
const { UserStatus } = require('../database/mongoose.js');

const resolvePending = (params) => {
  const { userId } = params;
  const eventName = `pending-${userId}`;
  console.log(botEvents);
  botEvents.emit(eventName, params);
};

const waitForMessage = async (userId) => {
  UserStatus.set(userId, 'pending');
  return new Promise((resolve, reject) => {
    const eventName = `pending-${userId}`;
    botEvents.once(eventName, (newParams) => {
      resolve(newParams);
      UserStatus.del(userId);
    });
  });
};

module.exports = {
  resolvePending,
  waitForMessage,
};
