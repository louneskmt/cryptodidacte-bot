const { __ } = require('../../logger.js');
const Twitter = require('../../Twitter.js');
const linkAddress = require('./linkAddress.js');
const { User } = require('../../database/mongoose.js');
const { end } = require('../global.js');

const messageTemplates = require('../../../data/message_templates.json');
const insertVariablesInTemplate = require('../../helpers/insertVariablesInTemplate.js');
const validators = require('../../helpers/validators.js');

async function linkAddressCommand(params, args) {
  const { userId } = params;
  const address = args[0];
  if (!address) return linkAddress(params);
  if (!validators.isEthereumAddress(address)) return end(params, { description: '❌ This is not a valid Ethereum address, please try again.', endMessage: false });

  const CurrentUser = await User.findByUserId(userId);
  if (!CurrentUser) {
    const userInfo = await Twitter.getUserInfo({ userId });
    const NewUser = new User({
      _id: userId,
      username: userInfo.screen_name,
      address,
    });
    NewUser.save();
    return;
  }

  User
    .updateAddress(userId, address)
    .then(() => {
      Twitter.sendMessage(userId, insertVariablesInTemplate(messageTemplates.fidelity.linkAddressOk, { address }));
      end(params);
    })
    .catch((err) => {
      __(`Error while updating address of user ${userId}: ${err}`);
      end(params, { description: messageTemplates.global.error });
    });
}

module.exports = linkAddressCommand;
