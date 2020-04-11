/* eslint-disable no-param-reassign */
const insertVariablesInTemplate = (messageData, params) => {
  for (const key in params) {
    __(messageData, key);
    const regex = new RegExp(`%{(${key.toString()})}`, 'gm');
    messageData.text = messageData.text.replace(regex, params[key]);
  }
  return messageData;
};

module.exports = insertVariablesInTemplate;
