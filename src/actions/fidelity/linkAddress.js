const { __ } = require('../../logger.js');
const Twitter = require('../../Twitter.js');
const { User } = require('../../database/mongoose.js');
const { waitForPattern } = require('../../helpers/pending.js');
const { end } = require('../global.js');

const messageTemplates = require('../../../data/message_templates.json');
const insertVariablesInTemplate = require('../../helpers/insertVariablesInTemplate.js');
const validators = require('../../helpers/validators.js');

async function linkAddress(params) {
  const { userId } = params;
  Twitter.sendMessage(userId, messageTemplates.fidelity.linkAddress);

  const response = await waitForPattern(userId, { validator: validators.isEthereumAddress });
  if (!response) return end(params, 'Timeout, please try again.');

  const address = response.message;

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

module.exports = linkAddress;
