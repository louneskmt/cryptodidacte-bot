const sendMenu = require('./actions/menu.js');
const generateInvoice = require('./actions/tip.js');
const { claimRewards, countRewards } = require('./actions/lnquiz/claimRewards.js');
const { end, retry } = require('./actions/global.js');
const { addWinners, tryAddWinners, waitForWinners } = require('./actions/lnquiz/addWinners.js');
const { updateRewards, updatingRewards, sendRewardsInfo } = require('./actions/lnquiz/updateRewards.js');
const withdraw = require('./actions/fidelity/withdraw.js');
const linkAddress = require('./actions/fidelity/linkAddress.js');

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
};
