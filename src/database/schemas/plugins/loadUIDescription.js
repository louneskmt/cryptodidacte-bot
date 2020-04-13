/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */
/* eslint-disable no-unused-vars */
function loadUIDescription() {
  const UIDescription = require(`../descriptions/${this.modelName}.json`);
  if (!UIDescription) throw new Error(`Model ${this.modelName} doesn't have description.`);
  return UIDescription;
}

module.exports = function loadUIDescriptionPlugin(schema, options) {
  schema.statics.loadUIDescription = loadUIDescription;
};
