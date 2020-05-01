// FIDELITY
const withdrawCommand = require('./actions/fidelity/withdrawCommand.js');
const linkAddressCommand = require('./actions/fidelity/linkAddressCommand.js');
const getBalanceCommand = require('./actions/fidelity/getBalanceCommand.js');
const getAddressCommand = require('./actions/fidelity/getAddressCommand.js');
const sendCommand = require('./actions/fidelity/sendCommand.js');

module.exports = {
  withdraw: withdrawCommand,
  linkAddress: linkAddressCommand,
  getBalance: getBalanceCommand,
  getAddress: getAddressCommand,
  send: sendCommand,
};
