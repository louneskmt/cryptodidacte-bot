/* eslint-disable no-unused-vars */
/* eslint-disable no-param-reassign */
function findByUserId(userId) {
  return this.find({ userId });
}

module.exports = function findByUserIdPlugin(schema, options) {
  schema.statics.findByUserId = findByUserId;
};
