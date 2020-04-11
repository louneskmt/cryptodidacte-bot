const { __ } = require('../logger.js');

/* eslint-disable no-param-reassign */
const insertVariablesInTemplate = (messageData, params) => {
  const clone = Object.assign(messageData, {});

  for (const key in params) {
    __(key, 2);
    const regex = new RegExp(`%{(${key.toString()})}`, 'gm');
    clone.text = clone.text.replace(regex, params[key]);
  }
  return clone;
};

module.exports = insertVariablesInTemplate;
