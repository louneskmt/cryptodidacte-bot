const { __ } = require('../../logger.js');
const Twitter = require('../../Twitter.js');
const linkAddress = require('./linkAddress.js');
const { User } = require('../../database/mongoose.js');
const { end } = require('../global.js');

const messageTemplates = require('../../../data/message_templates.json');
const insertVariablesInTemplate = require('../../helpers/insertVariablesInTemplate.js');


async function linkAddressCommand(params, args) {
  const { userId } = params;
  const address = args[0];
  if (!address) return linkAddress(params);

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
      end(params, messageTemplates.global.error);
    });
}

module.exports = linkAddressCommand;
