const Twitter = require('../../Twitter.js');
const { end } = require('../global.js');
const { getLinkedAddress } = require('../../fidelity.js');

const messageTemplates = require('../../../data/message_templates.json');
const insertVariablesInTemplate = require('../../helpers/insertVariablesInTemplate.js');

function getAddressCommand(params, args) {
  const { userId } = params;

  getLinkedAddress(userId)
    .then((address) => {
      if (address && address !== '') Twitter.sendMessage(userId, insertVariablesInTemplate(messageTemplates.fidelity.getAddressOk, { address }));
      else Twitter.sendMessage(userId, messageTemplates.fidelity.getAddressNone);
      end(params, { endMessage: false });
    });
}

module.exports = getAddressCommand;
