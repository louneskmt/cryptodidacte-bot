const { __ } = require('../../logger.js');
const Twitter = require('../../Twitter.js');
const { User } = require('../../database/mongoose.js');
const { end } = require('../global.js');

const messageTemplates = require('../../../data/message_templates.json');
const insertVariablesInTemplate = require('../../helpers/insertVariablesInTemplate.js');

const getAddress = (params) => {
  const { userId } = params;

  User
    .findByUserId(userId)
    .then((result) => {
      const { address } = result;
      if (address && address !== '') Twitter.sendMessage(userId, insertVariablesInTemplate(messageTemplates.fidelity.getAddressOk, { address }));
      else Twitter.sendMessage(userId, messageTemplates.fidelity.getAddressNone);
      end(params);
    })
    .catch((err) => __(`Error fetching linked address of user ${userId}: ${err}`));
};

module.exports = getAddress;
