/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */
/* eslint-disable no-unused-vars */
const { __ } = require('../../../logger.js');

function loadUIDescription() {
  const UIDescription = require(`../descriptions/${this.modelName}.json`);
  if (!UIDescription) {
    __(`Tried to load model ${this.modelName} but it was not fount`, 0);
    throw new Error(`Model ${this.modelName} doesn't have description.`);
  }
  return UIDescription;
}

module.exports = function loadUIDescriptionPlugin(schema, options) {
  schema.statics.loadUIDescription = loadUIDescription;
};
