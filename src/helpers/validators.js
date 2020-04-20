/* eslint-disable no-param-reassign */
const { isAddress } = require('web3-utils');
const lightning = require('../../lightning.rest.js');

/**
 * Checks if the given string is an address
 *
 * @method isEthereumAddress
 * @param {String} address the given HEX address
 * @return {Boolean}
 */
const isEthereumAddress = function (address) {
  return isAddress(address);
};

/**
 * Checks if the given string is an Lightning Network payment request (invoice)
 *
 * @method isLightningInvoice
 * @param {String} invoice the given string invoice
 * @return {Promise} resolves {Boolean}
 */
const isLightningInvoice = async function (invoice) {
  return new Promise((resolve, reject) => {
    lightning.getInvoiceData(invoice)
      .then(() => resolve(true))
      .catch(() => resolve(false));
  });
};


module.exports = {
  isEthereumAddress,
  isLightningInvoice,
};
