// src/index.js
const ethers = require('ethers');
const CryptodidacteTokenABI = require(__dirname + '/contracts/CryptodidacteToken.json').abi;
const { mnemonic, projectId, contractAddress } = require(__dirname + '/config.js').ethereumConfig;

class Ethereum {
    constructor() {
        this.provider = new ethers.providers.InfuraProvider('rinkeby', projectId);
        this.wallet = ethers.Wallet.fromMnemonic(mnemonic, "m/44'/60'/0'/0/0").connect(provider);
        this.contract = new ethers.Contract(contractAddress, CryptodidacteTokenABI, wallet);
    }

    async sendCDT(to, amount) {
        return new Promise((resolve, reject) => {
            try {
                let tx = await this.contract.transfer(to, amount);
                resolve(tx.hash, tx.wait());
            } catch (err) {
                reject(err)
            }  
        });
    }

    async mintCDT(amount, to = this.address.wallet) {
        return new Promise((resolve, reject) => {
            try {
                let tx = await this.contract.mint(to, amount);
                resolve(tx.hash, tx.wait());
            } catch (err) {
                reject(err)
            }  
        });
    }
}
