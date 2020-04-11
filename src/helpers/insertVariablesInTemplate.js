/* eslint-disable no-param-reassign */
const { __ } = require('../logger.js');

const insertVariablesInTemplate = (messageData, params) => {
  for (const key in params) {
    __(messageData, 2);
    __(key, 2)
    const regex = new RegExp(`%{(${key.toString()})}`, 'gm');
    messageData.text = messageData.text.replace(regex, params[key]);
  }
  return messageData;
};

module.exports = insertVariablesInTemplate;
