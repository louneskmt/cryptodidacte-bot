// GLOBAL
const sendMenu = require('./actions/menu.js');
const { end, retry } = require('./actions/global.js');

// LNQUIZ
const { claimRewards, countRewards } = require('./actions/lnquiz/claimRewards.js');
const { addWinners, tryAddWinners, waitForWinners } = require('./actions/lnquiz/addWinners.js');
const { updateRewards, updatingRewards, sendRewardsInfo } = require('./actions/lnquiz/updateRewards.js');

// FIDELITY
const withdraw = require('./actions/fidelity/withdraw.js');
const linkAddress = require('./actions/fidelity/linkAddress.js');
const getAddress = require('./actions/fidelity/getAddress.js');

// OTHERS
const generateInvoice = require('./actions/tip.js');

module.exports = {
  sendMenu,
  claimRewards,
  end,
  retry,
  addWinners,
  tryAddWinners,
  waitForWinners,
  countRewards,
  generateInvoice,
  withdraw,
  linkAddress,
  updateRewards,
  updatingRewards,
  sendRewardsInfo,
  getAddress,
};
