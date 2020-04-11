const { __ } = require('../logger.js');

/* eslint-disable no-param-reassign */
const insertVariablesInTemplate = (messageData, params) => {
  let { text } = messageData;

  for (const key in params) {
    __(text, 2);
    const regex = new RegExp(`%{(${key.toString()})}`, 'gm');
    text = text.replace(regex, params[key]);
  }
  messageData.text = text;
  return messageData;
};

module.exports = insertVariablesInTemplate;
