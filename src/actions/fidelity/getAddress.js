const Twitter = require('../../Twitter.js');
const { end } = require('../global.js');
const { getLinkedAddress } = require('../../fidelity.js');

const messageTemplates = require('../../../data/message_templates.json');
const insertVariablesInTemplate = require('../../helpers/insertVariablesInTemplate.js');

const getAddress = (params) => {
  const { userId } = params;

  getLinkedAddress(userId)
    .then((address) => {
      if (address && address !== '') Twitter.sendMessage(userId, insertVariablesInTemplate(messageTemplates.fidelity.getAddressOk, { address }));
      else Twitter.sendMessage(userId, messageTemplates.fidelity.getAddressNone);
      end(params);
    });
};

module.exports = getAddress;
