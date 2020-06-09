const ethers = require('ethers');
const web3 = require('web3-utils');

const { mnemonic, projectId } = require('../config.js').ethereumConfig;

class ERC20 {
  constructor(contractAddress, contractABI) {
    this.provider = new ethers.providers.InfuraProvider('rinkeby', projectId);
    this.wallet = ethers.Wallet.fromMnemonic(mnemonic, "m/44'/60'/0'/0/0").connect(this.provider);
    this.contract = new ethers.Contract(contractAddress, contractABI, this.wallet);
  }

  async method(method, ...args) {
    return new Promise((resolve, reject) => {
      try {
        this.contract[method](...args)
          .then((tx) => {
            resolve(tx);
          });
      } catch (err) {
        reject(err);
      }
    });
  }

  async send(to, amount) {
    return this.method('transfer', to, amount);
  }

  async mint(amount, to = this.wallet.address) {
    return this.method('mint', to, amount);
  }
}

/**
 * Checks if the given string is an address
 *
 * @method isEthereumAddress
 * @param {String} address the given HEX address
 * @return {Boolean}
 */
const isEthereumAddress = function (address) {
  return web3.isAddress(address);
};

module.exports = {
  ERC20,
  isEthereumAddress,
};
