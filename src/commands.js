// FIDELITY
const withdrawCommand = require('./actions/fidelity/withdrawCommand.js');
const linkAddressCommand = require('./actions/fidelity/linkAddressCommand.js');

module.exports = {
  withdraw: withdrawCommand,
  linkAddress: linkAddressCommand,
};
