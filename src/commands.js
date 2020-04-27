// FIDELITY
const withdrawCommand = require('./actions/fidelity/withdrawCommand.js');
const linkAddressCommand = require('./actions/fidelity/linkAddressCommand.js');
const getBalanceCommand = require('./actions/fidelity/getBalanceCommand.js');

module.exports = {
  withdraw: withdrawCommand,
  linkAddress: linkAddressCommand,
  getBalance: getBalanceCommand,
};
