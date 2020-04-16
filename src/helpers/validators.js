/* eslint-disable no-param-reassign */
const { isAddress } = require('web3-utils').utils;

/**
 * Checks if the given string is an address
 *
 * @method isAddress
 * @param {String} address the given HEX address
 * @return {Boolean}
 */
const isEthereumAddress = function (address) {
  return isAddress(address);
};

module.exports = {
  isEthereumAddress,
};
