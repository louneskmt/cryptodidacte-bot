const ethers = require('ethers');

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

module.exports = {
  ERC20,
};
